import { useEffect, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({ component: HomePage });

type Todo = { id: string; text: string; done: boolean; due: string };

const KEY = 'todos-v1';

function today(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

function formatDue(due: string): string {
  const [y, m, d] = due.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function HomePage() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY) ?? '[]') as Todo[];
    } catch {
      return [];
    }
  });
  const [text, setText] = useState('');
  const [due, setDue] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'done'>('all');

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(todos));
  }, [todos]);

  function add(e: React.FormEvent) {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    setTodos([{ id: crypto.randomUUID(), text: t, done: false, due }, ...todos]);
    setText('');
    setDue('');
  }

  const visible = todos
    .filter((t) => (filter === 'all' ? true : filter === 'done' ? t.done : !t.done))
    .sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      if (a.due && b.due) return a.due.localeCompare(b.due);
      return a.due ? -1 : b.due ? 1 : 0;
    });
  const left = todos.filter((t) => !t.done).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-sky-100 px-4 py-12">
      <div className="mx-auto max-w-xl">
        <h1 className="text-3xl font-bold text-slate-800">My Tasks</h1>
        <p className="mt-1 text-sm text-slate-500">
          {left} {left === 1 ? 'task' : 'tasks'} left
        </p>

        <form onSubmit={add} className="mt-6 flex flex-wrap gap-2 rounded-2xl bg-white p-3 shadow-sm">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What needs doing?"
            className="min-w-0 flex-1 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-300"
          />
          <input
            type="date"
            value={due}
            onChange={(e) => setDue(e.target.value)}
            className="rounded-lg border border-slate-200 px-2 py-2 text-sm text-slate-600"
          />
          <button className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700">
            Add
          </button>
        </form>

        <div className="mt-4 flex gap-2">
          {(['all', 'active', 'done'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1 text-sm capitalize ${
                filter === f ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {f}
            </button>
          ))}
          {todos.some((t) => t.done) && (
            <button
              onClick={() => setTodos(todos.filter((t) => !t.done))}
              className="ml-auto text-sm text-slate-500 underline underline-offset-2 hover:text-slate-700"
            >
              Clear completed
            </button>
          )}
        </div>

        <ul className="mt-4 space-y-2">
          {visible.length === 0 && (
            <li className="rounded-2xl bg-white/60 p-8 text-center text-slate-500">Nothing here yet 🎉</li>
          )}
          {visible.map((t) => {
            const overdue = !t.done && t.due && t.due < today();
            return (
              <li key={t.id} className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm">
                <input
                  type="checkbox"
                  checked={t.done}
                  onChange={() => setTodos(todos.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)))}
                  className="size-5 accent-indigo-600"
                />
                <span className={`flex-1 ${t.done ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                  {t.text}
                </span>
                {t.due && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      overdue ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {overdue ? 'Overdue · ' : ''}
                    {formatDue(t.due)}
                  </span>
                )}
                <button
                  onClick={() => setTodos(todos.filter((x) => x.id !== t.id))}
                  aria-label="Delete"
                  className="text-slate-400 hover:text-red-500"
                >
                  ✕
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
