import React, { useState, useEffect } from 'react';

export default function App() {
  const [activeTab, setActiveTab] = useState('timer');
  const [feedings, setFeedings] = useState([]);
  const [sleeps, setSleeps] = useState([]);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);

  // Таймер сна
  const [sleepTimerActive, setSleepTimerActive] = useState(false);
  const [sleepTimerStart, setSleepTimerStart] = useState(null);
  const [sleepTimerElapsed, setSleepTimerElapsed] = useState(0);

  // Таймер кормления
  const [feedingTimerActive, setFeedingTimerActive] = useState(false);
  const [feedingTimerStart, setFeedingTimerStart] = useState(null);
  const [feedingMl, setFeedingMl] = useState('');
  const [feedingTimerElapsed, setFeedingTimerElapsed] = useState(0);

  // Инициализация данных
  useEffect(() => {
    const savedFeedings = JSON.parse(localStorage.getItem('feedings') || '[]');
    const savedSleeps = JSON.parse(localStorage.getItem('sleeps') || '[]');
    const savedNotes = JSON.parse(localStorage.getItem('notes') || '[]');
    const savedWeight = localStorage.getItem('weight') || '';
    const savedHeight = localStorage.getItem('height') || '';

    setFeedings(savedFeedings);
    setSleeps(savedSleeps);
    setNotes(savedNotes);
    setWeight(savedWeight);
    setHeight(savedHeight);
  }, []);

  // Сохранение данных
  useEffect(() => {
    localStorage.setItem('feedings', JSON.stringify(feedings));
  }, [feedings]);

  useEffect(() => {
    localStorage.setItem('sleeps', JSON.stringify(sleeps));
  }, [sleeps]);

  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('weight', weight);
  }, [weight]);

  useEffect(() => {
    localStorage.setItem('height', height);
  }, [height]);

  // Таймер сна
  useEffect(() => {
    let interval;
    if (sleepTimerActive) {
      interval = setInterval(() => {
        setSleepTimerElapsed(Math.floor((Date.now() - sleepTimerStart) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sleepTimerActive, sleepTimerStart]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startSleepTimer = () => {
    if (!sleepTimerActive) {
      setSleepTimerStart(Date.now());
      setSleepTimerActive(true);
    }
  };

  const stopSleepTimer = () => {
    if (sleepTimerActive) {
      const duration = sleepTimerElapsed;
      setSleepTimerActive(false);
      setSleeps([
        ...sleeps,
        {
          id: Date.now(),
          duration,
          date: currentDate,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setSleepTimerElapsed(0);
    }
  };

  const startFeedingTimer = () => {
    if (!feedingTimerActive) {
      setFeedingTimerStart(Date.now());
      setFeedingTimerActive(true);
    }
  };

  const stopFeedingTimer = () => {
    if (feedingTimerActive) {
      const duration = Math.floor((Date.now() - feedingTimerStart) / 1000 / 60);
      setFeedingTimerActive(false);
      setFeedingTimerElapsed(0);
      setFeedingTimerStart(null);
      setFeedings([
        ...feedings,
        {
          id: Date.now(),
          type: 'breast',
          date: currentDate,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          duration
        }
      ]);
    }
  };

  const addBottleFeeding = () => {
    if (feedingMl.trim()) {
      setFeedings([
        ...feedings,
        {
          id: Date.now(),
          type: 'bottle',
          date: currentDate,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          ml: parseInt(feedingMl)
        }
      ]);
      setFeedingMl('');
    }
  };

  const addNote = () => {
    if (newNote.trim()) {
      setNotes([
        ...notes,
        {
          id: Date.now(),
          text: newNote,
          date: currentDate,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setNewNote('');
    }
  };

  const deleteNote = (id) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  const deleteAllNotes = () => {
    setNotes([]);
  };

  const totalFeedingsToday = feedings.filter(f => f.date === currentDate).length;
  const totalSleepToday = sleeps
    .filter(s => s.date === currentDate)
    .reduce((sum, s) => sum + s.duration, 0);

  const feedingChartData = feedings
    .filter(f => f.date === currentDate)
    .map((f, i) => ({ x: i + 1, y: i + 1 }))
    .reverse();

  const sleepChartData = sleeps
    .filter(s => s.date === currentDate)
    .map((s, i) => ({ x: i + 1, y: s.duration / 60 }))
    .reverse();

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-purple-50 to-indigo-100 text-gray-800">
      {/* Таймеры */}
      <section className="p-4 space-y-4">
        {activeTab === 'timer' && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center justify-center">
              <SleepIcon /> Таймер сна
            </h2>
            <div className="flex items-center justify-center mb-6">
              <span className="text-6xl font-mono">{formatTime(sleepTimerElapsed)}</span>
            </div>
            <div className="flex justify-center space-x-4">
              {!sleepTimerActive ? (
                <button
                  onClick={startSleepTimer}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl transition"
                >
                  Старт
                </button>
              ) : (
                <button
                  onClick={stopSleepTimer}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl transition"
                >
                  Стоп
                </button>
              )}
            </div>
          </div>
        )}

        {activeTab === 'feed' && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center justify-center">
              <FeedIcon /> Кормление
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={feedingTimerActive ? stopFeedingTimer : startFeedingTimer}
                className={`py-4 rounded-xl transition flex flex-col items-center justify-center ${
                  feedingTimerActive
                    ? 'bg-red-100 hover:bg-red-200 text-red-800'
                    : 'bg-pink-100 hover:bg-pink-200 text-pink-800'
                }`}
              >
                <BreastIcon />
                <span className="mt-2">{feedingTimerActive ? 'Остановить' : 'Грудь'}</span>
              </button>
              <div className="flex flex-col space-y-2">
                <input
                  type="number"
                  value={feedingMl}
                  onChange={(e) => setFeedingMl(e.target.value)}
                  placeholder="мл"
                  className="border rounded-lg px-4 py-3 text-center"
                />
                <button
                  onClick={addBottleFeeding}
                  className="bg-blue-100 hover:bg-blue-200 text-blue-800 py-3 rounded-xl transition flex flex-col items-center"
                >
                  <BottleIcon />
                  <span className="mt-1">Бутылочка</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Навигация */}
      <nav className="flex justify-around bg-white shadow-md fixed bottom-0 left-0 right-0 z-10">
        <button
          onClick={() => setActiveTab('timer')}
          className={`py-3 px-4 flex flex-col items-center ${activeTab === 'timer' ? 'text-indigo-600 border-t-2 border-indigo-600' : 'text-gray-500'}`}
        >
          <TimerIcon /> <span className="mt-1 text-xs">Сон</span>
        </button>
        <button
          onClick={() => setActiveTab('feed')}
          className={`py-3 px-4 flex flex-col items-center ${activeTab === 'feed' ? 'text-indigo-600 border-t-2 border-indigo-600' : 'text-gray-500'}`}
        >
          <FeedIcon /> <span className="mt-1 text-xs">Кормление</span>
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`py-3 px-4 flex flex-col items-center ${activeTab === 'stats' ? 'text-indigo-600 border-t-2 border-indigo-600' : 'text-gray-500'}`}
        >
          <ChartIcon /> <span className="mt-1 text-xs">Статистика</span>
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`py-3 px-4 flex flex-col items-center ${activeTab === 'notes' ? 'text-indigo-600 border-t-2 border-indigo-600' : 'text-gray-500'}`}
        >
          <NoteIcon /> <span className="mt-1 text-xs">Заметки</span>
        </button>
      </nav>

      {/* Контент */}
      <main className="p-4 pt-24 pb-24">
        {activeTab === 'timer' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-lg p-4">
              <h3 className="font-semibold mb-2">История сна за сегодня</h3>
              {sleeps.filter(s => s.date === currentDate).length > 0 ? (
                <ul className="space-y-2">
                  {sleeps
                    .filter(s => s.date === currentDate)
                    .map(sleep => (
                      <li key={sleep.id} className="flex justify-between items-center py-2 border-b">
                        <span>{sleep.time}</span>
                        <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                          {Math.round(sleep.duration / 60)} мин
                        </span>
                      </li>
                    ))
                  }
                </ul>
              ) : (
                <p className="text-gray-500 italic">Нет данных за сегодня</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'feed' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-lg p-4">
              <h3 className="font-semibold mb-2">История кормлений за сегодня</h3>
              {feedings.filter(f => f.date === currentDate).length > 0 ? (
                <ul className="space-y-2">
                  {feedings
                    .filter(f => f.date === currentDate)
                    .map(feeding => (
                      <li key={feeding.id} className="flex justify-between items-center py-2 border-b">
                        <span>{feeding.time}</span>
                        <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                          {feeding.type === 'breast' ? `Грудь (${feeding.duration} мин)` : `Бутылочка (${feeding.ml} мл)`}
                        </span>
                      </li>
                    ))
                  }
                </ul>
              ) : (
                <p className="text-gray-500 italic">Нет данных за сегодня</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-lg p-4">
              <h2 className="text-xl font-bold mb-4">Статистика за сегодня</h2>
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Количество кормлений</h3>
                <div className="bg-gray-100 h-4 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-pink-400 to-purple-500 h-full"
                    style={{ width: `${Math.min(totalFeedingsToday * 10, 100)}%` }}
                  ></div>
                </div>
                <p className="mt-2 text-sm">{totalFeedingsToday} кормлений</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Общая продолжительность сна</h3>
                <div className="bg-gray-100 h-4 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-400 to-indigo-500 h-full"
                    style={{ width: `${Math.min((totalSleepToday / 60) * 10, 100)}%` }}
                  ></div>
                </div>
                <p className="mt-2 text-sm">{Math.round(totalSleepToday / 60)} минут</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-4">
              <h2 className="text-xl font-bold mb-4">Графики</h2>
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Кормления</h3>
                <div className="h-32 flex items-end space-x-2">
                  {feedingChartData.map((point, i) => (
                    <div
                      key={i}
                      style={{ height: `${Math.min(point.y * 20, 100)}%` }}
                      className="bg-pink-400 rounded-t w-6"
                    ></div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Сон (в минутах)</h3>
                <div className="h-32 flex items-end space-x-2">
                  {sleepChartData.map((point, i) => (
                    <div
                      key={i}
                      style={{ height: `${Math.min(point.y * 10, 100)}%` }}
                      className="bg-purple-400 rounded-t w-6"
                    ></div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-4">
              <h2 className="text-xl font-bold mb-4">Вес и рост</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Вес (кг)</label>
                  <input
                    type="text"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="Введите вес"
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Рост (см)</label>
                  <input
                    type="text"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="Введите рост"
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div className="text-center mt-4">
                  {weight && height ? (
                    <>
                      <p>Текущие параметры:</p>
                      <p className="font-semibold">{weight} кг / {height} см</p>
                    </>
                  ) : (
                    <p className="text-gray-500 italic">Данные не введены</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-lg p-4">
              <h2 className="text-xl font-bold mb-4">Заметки</h2>
              <div className="mb-4">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Добавьте заметку..."
                  rows="3"
                  className="w-full border rounded-lg px-3 py-2 mb-2"
                ></textarea>
                <button
                  onClick={addNote}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg w-full"
                >
                  Добавить
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold">Ваши заметки</h3>
                {notes.length > 0 && (
                  <button
                    onClick={deleteAllNotes}
                    className="text-red-500 text-sm"
                  >
                    Очистить все
                  </button>
                )}
              </div>
              {notes.length > 0 ? (
                <ul className="space-y-3">
                  {notes
                    .filter(n => n.date === currentDate)
                    .map(note => (
                      <li key={note.id} className="border-b pb-3">
                        <div className="flex justify-between">
                          <span className="font-medium">{note.time}</span>
                          <button
                            onClick={() => deleteNote(note.id)}
                            className="text-red-500 text-sm"
                          >
                            Удалить
                          </button>
                        </div>
                        <p className="mt-1">{note.text}</p>
                      </li>
                    ))
                  }
                </ul>
              ) : (
                <p className="text-gray-500 italic">Нет заметок за сегодня</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Иконки
function TimerIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function FeedIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}

function SleepIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function NoteIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function BreastIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C8.69 2 6 4.69 6 8c0 3.31 2.69 6 6 6s6-2.69 6-6c0-3.31-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
      <path d="M12 14c-1.1 0-2-.9-2-2h-2c0 2.21 1.79 4 4 4v-2z" />
    </svg>
  );
}

function BottleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 10c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" />
    </svg>
  );
}