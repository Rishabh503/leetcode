'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Loader2, Trash2, ChevronDown, ChevronRight, Folder, FolderPlus, FileText, Play } from 'lucide-react';

const difficultyColors = {
  Easy: 'bg-green-100 text-green-700',
  Medium: 'bg-yellow-100 text-yellow-700',
  Hard: 'bg-red-100 text-red-700'
};

export default function ListsPage() {
  const [groups, setGroups] = useState([]);
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isManageMode, setIsManageMode] = useState(false);
  
  // Create Group State
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [showGroupForm, setShowGroupForm] = useState(false);

  // Create List State
  const [creatingListFor, setCreatingListFor] = useState(null); // groupId or 'uncategorized'
  const [newListTitle, setNewListTitle] = useState('');

  // Accordion state
  const [expandedGroups, setExpandedGroups] = useState(new Set());
  const [expandedLists, setExpandedLists] = useState(new Set());

  const fetchData = async () => {
    setLoading(true);
    try {
      const [groupsRes, listsRes] = await Promise.all([
        fetch('/api/groups'),
        fetch('/api/lists')
      ]);
      if (groupsRes.ok && listsRes.ok) {
        const groupsData = await groupsRes.json();
        const listsData = await listsRes.json();
        setGroups(groupsData.groups);
        setLists(listsData.lists);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    setCreatingGroup(true);
    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newGroupName }),
      });
      if (res.ok) {
        setNewGroupName('');
        setShowGroupForm(false);
        await fetchData();
      }
    } finally {
      setCreatingGroup(false);
    }
  };

  const handleCreateList = async (e, groupId) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;
    const finalGroupId = groupId === 'uncategorized' ? null : groupId;
    
    try {
      const res = await fetch('/api/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newListTitle, groupId: finalGroupId }),
      });
      if (res.ok) {
        setNewListTitle('');
        setCreatingListFor(null);
        await fetchData();
        toggleGroup(groupId, true);
      }
    } finally {
    }
  };

  const handleDeleteList = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this list?')) return;
    try {
      const res = await fetch(`/api/lists/${id}`, { method: 'DELETE' });
      if (res.ok) await fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleChangeGroup = async (listId, newGroupId) => {
    const finalGroupId = newGroupId === 'uncategorized' ? null : newGroupId;
    try {
      const res = await fetch(`/api/lists/${listId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId: finalGroupId }),
      });
      if (res.ok) {
        await fetchData();
        if (finalGroupId) toggleGroup(finalGroupId, true);
        else toggleGroup('uncategorized', true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleGroup = (groupId, forceExpand = false) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (forceExpand) next.add(groupId);
      else if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  const toggleList = (listId) => {
    setExpandedLists(prev => {
      const next = new Set(prev);
      if (next.has(listId)) next.delete(listId);
      else next.add(listId);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#E88C6D]" />
      </div>
    );
  }

  const listsByGroup = {};
  groups.forEach(g => { listsByGroup[g._id] = []; });
  listsByGroup['uncategorized'] = [];

  lists.forEach(l => {
    if (l.groupId && listsByGroup[l.groupId]) {
      listsByGroup[l.groupId].push(l);
    } else {
      listsByGroup['uncategorized'].push(l);
    }
  });

  const renderGroup = (groupId, groupName) => {
    const groupLists = listsByGroup[groupId];
    const isExpanded = expandedGroups.has(groupId);
    const isUncategorized = groupId === 'uncategorized';

    // Always show 'uncategorized' group if there are no groups at all and no lists, so they have a place to add lists without creating groups.
    if (isUncategorized && groupLists.length === 0 && !creatingListFor && groups.length > 0) return null;

    return (
      <div key={groupId} className="bg-white rounded-2xl border border-[#F5E6E0] shadow-sm overflow-hidden transition-all mb-4">
        {/* Group Header */}
        <div 
          onClick={() => toggleGroup(groupId)}
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FFF0EB] text-[#E88C6D] rounded-xl flex items-center justify-center shrink-0 shadow-sm">
               {isUncategorized ? <FileText size={20} /> : <Folder size={20} />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{groupName}</h2>
              <p className="text-xs text-gray-500 font-medium">
                 {groupLists.length} lists • {groupLists.reduce((acc, l) => acc + (l.questions?.length || 0), 0)} questions
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             {isManageMode && (
               <button 
                  onClick={(e) => { e.stopPropagation(); setCreatingListFor(groupId); if (!isExpanded) toggleGroup(groupId, true); }}
                  className="text-xs bg-gray-100 text-gray-600 hover:bg-[#E88C6D] hover:text-white px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1"
               >
                  <Plus size={14} /> Add List
               </button>
             )}
             {isExpanded ? <ChevronDown className="text-gray-400" /> : <ChevronRight className="text-gray-400" />}
          </div>
        </div>

        {/* Group Content (Lists) */}
        {isExpanded && (
          <div className="border-t border-gray-100 bg-gray-50/50 p-4 space-y-3">
            {creatingListFor === groupId && (
              <form onSubmit={(e) => handleCreateList(e, groupId)} className="flex gap-2 mb-3">
                <input
                  autoFocus
                  type="text"
                  placeholder="List name..."
                  value={newListTitle}
                  onChange={(e) => setNewListTitle(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#E88C6D] text-sm font-medium"
                />
                <button type="submit" className="bg-[#E88C6D] text-white px-4 py-2 rounded-xl font-bold text-sm">Save</button>
                <button type="button" onClick={() => setCreatingListFor(null)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-bold text-sm">Cancel</button>
              </form>
            )}

            {groupLists.length === 0 && !creatingListFor && (
              <div className="text-center py-6 text-gray-500 text-sm">No lists in this group yet.</div>
            )}

            {groupLists.map(list => {
               const listExpanded = expandedLists.has(list._id);
               return (
                 <div key={list._id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div 
                      onClick={() => toggleList(list._id)}
                      className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                         {listExpanded ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
                         <div className="font-bold text-gray-900 text-[15px]">{list.title}</div>
                         <div className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{list.questions?.length || 0} questions</div>
                      </div>
                      {isManageMode && (
                        <div className="flex items-center gap-2">
                          <select
                            value={list.groupId || 'uncategorized'}
                            onChange={(e) => handleChangeGroup(list._id, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs bg-gray-50 border border-gray-200 text-gray-700 rounded-lg px-2 py-1.5 outline-none hover:bg-gray-100 transition-colors mr-1 cursor-pointer font-medium max-w-[120px] truncate"
                          >
                            <option value="uncategorized">Uncategorized</option>
                            {groups.map(g => (
                              <option key={g._id} value={g._id}>{g.name}</option>
                            ))}
                          </select>
                          <Link href={`/dashboard/lists/${list._id}`} onClick={(e) => e.stopPropagation()} className="text-xs bg-[#FFF0EB] text-[#E88C6D] hover:bg-[#FFE3D6] px-3 py-1.5 rounded-lg font-bold transition-all shrink-0">
                            Manage
                          </Link>
                          <button onClick={(e) => handleDeleteList(e, list._id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg shrink-0">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Questions Accordion */}
                    {listExpanded && (
                      <div className="border-t border-gray-100 p-3 bg-[#FAFAFA]">
                         {!list.questions || list.questions.length === 0 ? (
                           <div className="text-center py-4 text-xs text-gray-500">No questions added yet. Click Manage to add.</div>
                         ) : (
                           <div className="space-y-2">
                             {list.questions.map((q, idx) => (
                               <div key={idx} className="bg-white p-2.5 rounded-lg border border-gray-100 flex items-center justify-between gap-3 hover:border-[#E88C6D] transition-colors group">
                                 <div className="flex items-center gap-2 min-w-0">
                                   <span className="text-xs font-bold text-gray-400 w-4 text-right">{idx + 1}.</span>
                                   <span className="text-sm font-bold text-gray-800 truncate">{q.title}</span>
                                   <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded shrink-0 ${difficultyColors[q.difficulty] || 'bg-gray-100 text-gray-600'}`}>
                                     {q.difficulty}
                                   </span>
                                 </div>
                                 {q.questionLink && (
                                   <a href={q.questionLink} target="_blank" rel="noopener noreferrer" className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[10px] bg-[#E88C6D] text-white px-2 py-1 rounded font-bold shrink-0">
                                     <Play size={10} fill="currentColor" /> Solve
                                   </a>
                                 )}
                               </div>
                             ))}
                           </div>
                         )}
                      </div>
                    )}
                 </div>
               );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-[#F5E6E0] shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Study Groups & Lists</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Organize your practice lists into logical groups.</p>
        </div>
        
        <div className="flex items-center gap-3">
          {!showGroupForm && (
             <button 
                onClick={() => setIsManageMode(!isManageMode)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm ${
                  isManageMode ? 'bg-[#FFF0EB] text-[#E88C6D] border border-[#F5E6E0]' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
             >
                {isManageMode ? 'Done Managing' : 'Manage Sheet'}
             </button>
          )}

          {isManageMode && !showGroupForm && (
             <button 
                onClick={() => setShowGroupForm(true)}
                className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-black shadow-md transition-all"
             >
                <FolderPlus size={18} /> New Group
             </button>
          )}
          
          {showGroupForm && (
             <form onSubmit={handleCreateGroup} className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
             <input
                autoFocus
                type="text"
                placeholder="Group name (e.g. Blind 75)..."
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm font-medium"
                required
             />
             <div className="flex gap-2">
               <button type="submit" disabled={creatingGroup} className="px-5 py-2.5 bg-gray-900 text-white font-bold rounded-xl text-sm disabled:opacity-50">
                 Save
               </button>
               <button type="button" onClick={() => setShowGroupForm(false)} className="px-5 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl text-sm">
                 Cancel
               </button>
             </div>
           </form>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {groups.map(g => renderGroup(g._id, g.name))}
        {renderGroup('uncategorized', 'Uncategorized')}
        
        {groups.length === 0 && lists.length === 0 && (
          <div className="text-center py-16 bg-white border border-[#F5E6E0] rounded-2xl mt-4">
             <Folder className="w-12 h-12 text-[#E88C6D] mx-auto mb-4 opacity-50" />
             <h3 className="text-lg font-bold text-gray-900">Your sheet is empty</h3>
             <p className="text-gray-500 text-sm mt-1">Create a group or add a list to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
