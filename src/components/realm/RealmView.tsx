import React from 'react';
import { Search } from 'lucide-react';
import { useChitter } from '../../context/ChitterContext';
import { RealmPostCard } from './RealmPostCard';

export const RealmView: React.FC<{onOpenNewChit?:()=>void;onOpenCamera?:()=>void}> = () => {
  const { realmPosts, setSearchOpen } = useChitter();
  return (
    <div className="min-h-full pb-28 text-white">
      <div className="sticky top-0 z-20 bg-zinc-950/95 px-4 pb-3 pt-3 backdrop-blur-xl">
        <button onClick={()=>setSearchOpen(true)} className="relative w-full rounded-full border border-zinc-800 bg-zinc-900 py-2.5 pl-10 pr-4 text-left text-sm text-zinc-500">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-400" />
          Search realms
        </button>
      </div>
      <div className="space-y-4 px-3 pt-3">
        {realmPosts.map(p=><RealmPostCard key={p.id} post={p}/>)}
      </div>
    </div>
  );
};
