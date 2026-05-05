'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Loader2, Search, X, PlusCircle, GripVertical, Play, Clock, Check } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, arrayMove, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const difficultyColors = {
  Easy: 'bg-green-100 text-green-700',
  Medium: 'bg-yellow-100 text-yellow-700',
  Hard: 'bg-red-100 text-red-700'
};

function SortableQuestionItem({ id, q, index, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { 
    transform: CSS.Transform.toString(transform), 
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-white p-3 rounded-lg border border-[#F5E6E0] shadow-sm hover:border-[#E88C6D] transition-colors flex items-center justify-between group gap-3 relative">
       {/* Drag Handle */}
       <div {...attributes} {...listeners} className="cursor-grab text-gray-300 hover:text-gray-500 focus:outline-none p-1 -ml-1 rounded">
          <GripVertical size={16} />
       </div>
       
       <div className="flex-1 min-w-0 flex items-center gap-3">
          {/* Index and Title */}
          <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-sm truncate">
             <span className="text-gray-400 font-bold w-5 text-right">{index + 1}.</span> 
             <span className="truncate">{q.title}</span>
             {q.isCustom && <span className="text-[10px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-md uppercase shrink-0">Custom</span>}
          </h3>
          
          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md shrink-0 ${difficultyColors[q.difficulty] || 'bg-gray-100 text-gray-600'}`}>
             {q.difficulty || 'Unknown'}
          </span>
       </div>

       {/* Actions */}
       <div className="flex items-center gap-2 shrink-0">
         {q.lastSolved && (
           <span className="text-[10px] text-gray-500 hidden sm:flex items-center gap-1 mr-2" title="Last Solved">
              <Clock size={12} /> {new Date(q.lastSolved).toLocaleDateString()}
           </span>
         )}
         {q.questionLink && (
            <a href={q.questionLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs bg-[#FFF0EB] text-[#E88C6D] hover:bg-[#FFE3D6] px-3 py-1.5 rounded-lg font-bold transition-colors">
               <Play size={12} fill="currentColor" /> Practice
            </a>
         )}
         <button onClick={() => onRemove(index)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0">
           <X size={18} strokeWidth={2.5} />
         </button>
       </div>
    </div>
  );
}


export default function ListDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const listId = params.id;

  const [list, setList] = useState(null);
  const [listQuestions, setListQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [solvedQuestions, setSolvedQuestions] = useState([]);
  const [addingQuestion, setAddingQuestion] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Selected questions for multi-select
  const [selectedQs, setSelectedQs] = useState(new Set());

  // Custom question state
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customDifficulty, setCustomDifficulty] = useState('Medium');
  const [customLink, setCustomLink] = useState('');
  const [customTags, setCustomTags] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchListDetails();
    fetchSolvedQuestions();
  }, [listId]);

  useEffect(() => {
    if (list && list.questions) {
       // Attach a stable ID for dnd-kit if missing
       const qs = list.questions.map((q, i) => ({
           ...q,
           _dndId: q._dndId || `dnd-${q.titleSlug || 'custom'}-${i}-${Date.now()}`
       }));
       setListQuestions(qs);
    }
  }, [list]);

  const fetchListDetails = async () => {
    try {
      const res = await fetch(`/api/lists/${listId}`);
      if (res.ok) {
        const data = await res.json();
        setList(data.list);
      } else {
        router.push('/dashboard/lists');
      }
    } catch (error) {
      console.error('Failed to fetch list details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSolvedQuestions = async () => {
    try {
      const res = await fetch('/api/submissions');
      if (res.ok) {
        const data = await res.json();
        // Extract unique questions 
        const uniques = [];
        const seen = new Set();
        data.submissions.forEach((sub) => {
          if (!seen.has(sub.titleSlug) && sub.titleSlug) {
            seen.add(sub.titleSlug);
            uniques.push(sub);
          }
        });
        setSolvedQuestions(uniques);
      }
    } catch (error) {
      console.error('Failed to fetch solved questions:', error);
    }
  };

  const toggleSelection = (titleSlug) => {
    const newSet = new Set(selectedQs);
    if (newSet.has(titleSlug)) newSet.delete(titleSlug);
    else newSet.add(titleSlug);
    setSelectedQs(newSet);
  };

  const handleAddSelectedQuestions = async () => {
    try {
      setAddingQuestion(true);
      
      const packagesToAdd = solvedQuestions
         .filter(q => selectedQs.has(q.titleSlug))
         .map(q => ({
             title: q.title,
             titleSlug: q.titleSlug,
             difficulty: q.difficulty,
             questionLink: q.questionLink || `https://leetcode.com/problems/${q.titleSlug}`,
             isCustom: false,
             topicTags: q.topicTags || [],
             lastSolved: q.timestamp || null
         }));

      const updatedQuestions = [...(list.questions || []), ...packagesToAdd];

      const res = await fetch(`/api/lists/${listId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: updatedQuestions }),
      });

      if (res.ok) {
        await fetchListDetails();
        setShowAddModal(false);
        setSelectedQs(new Set());
      }
    } catch (error) {
      console.error('Failed to add selected questions:', error);
    } finally {
      setAddingQuestion(false);
    }
  };

  const handleAddCustomQuestion = async () => {
    if (!customTitle) return alert('Title required');
    try {
      setAddingQuestion(true);
      const pkg = {
        title: customTitle,
        titleSlug: null,
        difficulty: customDifficulty,
        questionLink: customLink,
        isCustom: true,
        topicTags: customTags ? customTags.split(',').map(tag => tag.trim()).filter(t => t) : [],
        lastSolved: null
      };
      
      const updatedQuestions = [...(list.questions || []), pkg];

      const res = await fetch(`/api/lists/${listId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: updatedQuestions }),
      });

      if (res.ok) {
        await fetchListDetails();
        setShowAddModal(false);
        setShowCustomForm(false);
        setCustomTitle('');
        setCustomLink('');
        setCustomDifficulty('Medium');
        setCustomTags('');
      }
    } catch (error) {
      console.error('Failed to add question:', error);
    } finally {
      setAddingQuestion(false);
    }
  };

  const handleRemoveQuestion = async (indexToRemove) => {
    if (!confirm('Are you sure you want to remove this question?')) return;

    try {
      const updatedQuestions = listQuestions.filter((_, i) => i !== indexToRemove);
      setListQuestions(updatedQuestions); // Optimistic UI update
      
      const qsToSave = updatedQuestions.map(({ _dndId, ...rest }) => rest);
      const res = await fetch(`/api/lists/${listId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: qsToSave }),
      });

      if (!res.ok) {
        await fetchListDetails(); // Revert on failure
      }
    } catch (error) {
      console.error('Failed to remove question:', error);
      await fetchListDetails();
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    
    if (active && over && active.id !== over.id) {
      const oldIndex = listQuestions.findIndex((item) => item._dndId === active.id);
      const newIndex = listQuestions.findIndex((item) => item._dndId === over.id);
      
      const newItems = arrayMove(listQuestions, oldIndex, newIndex);
      setListQuestions(newItems);
      
      // Save order to backend
      try {
        const questionsToSave = newItems.map(({ _dndId, ...rest }) => rest);
        await fetch(`/api/lists/${listId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ questions: questionsToSave })
        });
      } catch (e) {
        console.error("Order save failed");
        fetchListDetails(); // Revert if failed
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#E88C6D]" />
      </div>
    );
  }

  if (!list) return null;

  const filteredQuestions = solvedQuestions.filter(q => 
    q.title?.toLowerCase().includes(searchQuery.toLowerCase())
  ).filter(q => 
    !list.questions?.some(lq => lq.titleSlug === q.titleSlug && lq.titleSlug !== null)
  );

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="bg-white p-5 rounded-xl border border-[#F5E6E0] shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">{list.title}</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">{listQuestions.length} questions in this list</p>
        </div>
        
        <button
          onClick={() => { setShowAddModal(true); setSelectedQs(new Set()); setSearchQuery(''); }}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-[#E88C6D] hover:bg-[#d77c5d] text-white font-bold rounded-lg transition-colors shadow-sm text-sm"
        >
          <Plus className="w-4 h-4" /> Add Questions
        </button>
      </div>

      <div className="space-y-4">
        {listQuestions.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-[#F5E6E0] flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-[#FFF0EB] text-[#E88C6D] rounded-full flex items-center justify-center mb-5">
               <PlusCircle size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">List is empty</h3>
            <p className="text-gray-500 max-w-sm mb-6 text-base">
              Start adding questions to this list for targeted practice and review.
            </p>
            <button
               onClick={() => { setShowAddModal(true); setSelectedQs(new Set()); setSearchQuery(''); }}
               className="px-6 py-3 bg-[#FFF0EB] text-[#E88C6D] hover:bg-[#FFE3D6] font-bold rounded-xl transition-colors shadow-sm"
            >
              Add first question
            </button>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
             <SortableContext items={listQuestions.map(q => q._dndId)} strategy={verticalListSortingStrategy}>
               <div className="space-y-2">
                 {listQuestions.map((q, idx) => (
                   <SortableQuestionItem key={q._dndId} id={q._dndId} q={q} index={idx} onRemove={handleRemoveQuestion} />
                 ))}
               </div>
             </SortableContext>
          </DndContext>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900">Add to List</h2>
              <button 
                onClick={() => { setShowAddModal(false); setShowCustomForm(false); setSelectedQs(new Set()); }}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1.5 transition-all"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 dark-scrollbar">
               <div className="flex gap-1.5 mb-5 bg-gray-100 p-1 rounded-xl">
                 <button 
                   className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!showCustomForm ? 'bg-white shadow-sm text-gray-900 scale-100' : 'text-gray-500 hover:text-gray-700'}`}
                   onClick={() => setShowCustomForm(false)}
                 >
                   From Solved Variables
                 </button>
                 <button 
                   className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${showCustomForm ? 'bg-white shadow-sm text-gray-900 scale-100' : 'text-gray-500 hover:text-gray-700'}`}
                   onClick={() => setShowCustomForm(true)}
                 >
                   Add Custom
                 </button>
               </div>

               {showCustomForm ? (
                 <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                   <div>
                     <label className="block text-sm font-bold text-gray-700 mb-1.5">Question Title</label>
                     <input
                       type="text"
                       placeholder="e.g. Find matching pairs in array"
                       value={customTitle}
                       onChange={(e) => setCustomTitle(e.target.value)}
                       className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E88C6D] focus:bg-white transition-all font-medium"
                     />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="block text-sm font-bold text-gray-700 mb-1.5">Difficulty</label>
                       <select
                         value={customDifficulty}
                         onChange={(e) => setCustomDifficulty(e.target.value)}
                         className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E88C6D] focus:bg-white transition-all font-medium"
                       >
                         <option>Easy</option>
                         <option>Medium</option>
                         <option>Hard</option>
                       </select>
                     </div>
                     <div>
                       <label className="block text-sm font-bold text-gray-700 mb-1.5">Tags (comma separated)</label>
                       <input
                         type="text"
                         placeholder="Array, Hash Table..."
                         value={customTags}
                         onChange={(e) => setCustomTags(e.target.value)}
                         className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E88C6D] focus:bg-white transition-all font-medium"
                       />
                     </div>
                   </div>
                   <div>
                     <label className="block text-sm font-bold text-gray-700 mb-1.5">Link (Optional)</label>
                     <input
                       type="url"
                       placeholder="https://..."
                       value={customLink}
                       onChange={(e) => setCustomLink(e.target.value)}
                       className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E88C6D] focus:bg-white transition-all font-medium"
                     />
                   </div>
                   <button
                     onClick={handleAddCustomQuestion}
                     disabled={addingQuestion || !customTitle}
                     className="w-full mt-4 py-3.5 bg-[#E88C6D] hover:bg-[#d77c5d] text-white font-bold rounded-xl transition-all flex justify-center items-center shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     {addingQuestion ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Custom Question'}
                   </button>
                 </div>
               ) : (
                 <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col h-[400px]">
                   <div className="relative">
                      <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search your valid solved questions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E88C6D] focus:bg-white transition-all text-sm font-medium"
                      />
                   </div>
                   
                   <div className="space-y-2 mt-4 flex-1 overflow-y-auto pr-2 dark-scrollbar">
                     {filteredQuestions.length === 0 ? (
                       <div className="text-center text-gray-500 py-12 flex flex-col items-center">
                          <Search size={40} className="text-gray-300 mb-3" />
                          <p className="font-medium">No valid questions found.</p>
                       </div>
                     ) : (
                       filteredQuestions.map((q) => {
                         const isSelected = selectedQs.has(q.titleSlug);
                         return (
                           <div 
                             key={q._id} 
                             onClick={() => toggleSelection(q.titleSlug)}
                             className={`flex items-center gap-3 p-3 border rounded-lg transition-all cursor-pointer ${isSelected ? 'border-[#E88C6D] bg-[#FFF0EB]' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'}`}
                           >
                             <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-[#E88C6D] border-[#E88C6D]' : 'border-gray-300 bg-white'}`}>
                               {isSelected && <Check size={12} className="text-white shrink-0" />}
                             </div>
                             <div className="flex items-center gap-2 flex-1 min-w-0">
                               <span className="font-bold text-gray-900 text-sm truncate">{q.title}</span>
                               <span className={`text-[10px] shrink-0 font-bold px-1.5 py-0.5 rounded ${difficultyColors[q.difficulty] || 'bg-gray-100 text-gray-600'}`}>
                                 {q.difficulty || 'Unknown'}
                               </span>
                             </div>
                           </div>
                         );
                       })
                     )}
                   </div>

                   <div className="pt-4 border-t border-gray-100 sticky bottom-0 bg-white">
                      <button
                        onClick={handleAddSelectedQuestions}
                        disabled={addingQuestion || selectedQs.size === 0}
                        className="w-full py-3.5 bg-[#E88C6D] hover:bg-[#d77c5d] text-white font-bold rounded-xl transition-all flex justify-center items-center shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {addingQuestion ? <Loader2 className="w-5 h-5 animate-spin" /> : `Add Selected (${selectedQs.size})`}
                      </button>
                   </div>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
