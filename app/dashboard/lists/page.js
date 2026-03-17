'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, List as ListIcon, Loader2, Trash2 } from 'lucide-react';

export default function ListsPage() {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');

  const fetchLists = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/lists');
      if (res.ok) {
        const data = await res.json();
        setLists(data.lists);
      }
    } catch (error) {
      console.error('Failed to fetch lists:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLists();
  }, []);

  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;

    try {
      setCreating(true);
      const res = await fetch('/api/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newListTitle }),
      });

      if (res.ok) {
        setNewListTitle('');
        await fetchLists();
      }
    } catch (error) {
      console.error('Failed to create list:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteList = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this list?')) return;

    try {
      const res = await fetch(`/api/lists/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await fetchLists();
      }
    } catch (error) {
      console.error('Failed to delete list:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#E88C6D]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="bg-white p-5 rounded-xl border border-[#F5E6E0] shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Your Lists</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Create custom question lists for targeted practice</p>
        </div>
        
        <form onSubmit={handleCreateList} className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="New list title..."
            value={newListTitle}
            onChange={(e) => setNewListTitle(e.target.value)}
            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E88C6D] text-sm font-medium"
            required
          />
          <button
            type="submit"
            disabled={creating}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-[#E88C6D] hover:bg-[#d77c5d] text-white font-bold rounded-lg transition-colors shadow-sm text-sm disabled:opacity-50"
          >
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Create
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {lists.length === 0 ? (
          <div className="col-span-full bg-white py-12 px-6 rounded-xl border border-[#F5E6E0] flex flex-col items-center justify-center text-center">
             <div className="w-12 h-12 bg-[#FFF0EB] text-[#E88C6D] rounded-full flex items-center justify-center mb-3">
               <ListIcon size={24} />
             </div>
             <h3 className="text-base font-bold text-gray-900 mb-1">No lists yet</h3>
             <p className="text-sm text-gray-500 max-w-sm">
               Create your first list above to start organizing your problem sets.
             </p>
          </div>
        ) : (
          lists.map((list) => (
            <Link 
              href={`/dashboard/lists/${list._id}`} 
              key={list._id}
              className="group flex items-center justify-between bg-white p-4 rounded-xl border border-[#F5E6E0] shadow-sm hover:shadow-md transition-all hover:border-[#E88C6D]"
            >
              <div className="flex items-center gap-3 min-w-0 pr-2">
                <div className="w-10 h-10 bg-[#FFF0EB] text-[#E88C6D] rounded-lg flex items-center justify-center shrink-0">
                  <ListIcon size={20} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-[15px] font-bold text-gray-900 truncate group-hover:text-[#E88C6D] transition-colors">{list.title}</h3>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    {list.questions?.length || 0} questions
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => handleDeleteList(e, list._id)}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors sm:opacity-0 group-hover:opacity-100 shrink-0"
              >
                <Trash2 size={16} />
              </button>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
