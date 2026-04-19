import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Image as ImageIcon, Send, Flame, User, Search, Filter, Globe, Users, Zap } from 'lucide-react';
import { auth } from '../lib/firebase';
import { createPost, subscribeToPosts, likePost } from '../lib/db';

export const CommunityFeed: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'global' | 'architecture' | 'trending'>('global');

  useEffect(() => {
    const unsubscribe = subscribeToPosts((updatedPosts) => {
      setPosts(updatedPosts);
    });
    return () => unsubscribe();
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim() || isPosting || !auth.currentUser) return;
    
    setIsPosting(true);
    try {
      await createPost(
        auth.currentUser.uid,
        auth.currentUser.displayName || 'Anonymous',
        auth.currentUser.photoURL || '',
        newPostContent
      );
      setNewPostContent('');
    } catch (error) {
      console.error("Failed to post:", error);
    } finally {
      setIsPosting(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await likePost(postId);
    } catch (error) {
      console.error("Failed to like:", error);
    }
  };

  const filteredPosts = posts.filter(post => 
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.authorName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-32">
      {/* Search & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-[var(--tech-border)] pb-10">
        <div className="relative flex-1 max-w-md tech-indent p-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
          <input 
            type="text" 
            placeholder="FILTER_SIGNALS..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none py-3 pl-12 pr-4 text-[10px] font-black uppercase tracking-widest text-[var(--tech-accent)] placeholder:text-zinc-800 outline-none transition-all"
          />
        </div>
        <div className="flex items-center space-x-2 bg-[var(--tech-inner)] border border-[var(--tech-border)] p-1.5 shadow-inner">
           {(['global', 'architecture', 'trending'] as const).map(tab => (
             <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 text-[9px] font-black uppercase tracking-[0.2em] transition-all border ${activeTab === tab ? 'bg-[var(--tech-accent)] text-black border-[var(--tech-accent)] shadow-[0_0_15px_var(--tech-glow)]' : 'text-zinc-600 border-transparent hover:text-white'}`}
             >
               {tab}
             </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-10">
          {/* Post Creator */}
          <div className="tech-panel p-8 bg-[var(--tech-inner)] border-[var(--tech-border)]">
            <form onSubmit={handleCreatePost}>
               <div className="flex items-center space-x-3 mb-6">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--tech-accent)] animate-pulse"></div>
                  <h3 className="text-[9px] font-black text-[var(--tech-text-dim)] uppercase tracking-[0.3em] italic">NEW_SPRINT_INITIATION</h3>
               </div>
               <textarea 
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                disabled={!auth.currentUser}
                placeholder={auth.currentUser ? "ENTER_SPRINT_LOG_DATA..." : "AUTH_FAILURE: ACCESS_DENIED"}
                className="w-full h-32 tech-indent p-6 text-[12px] font-black uppercase tracking-widest text-[var(--tech-text)] placeholder:text-zinc-800 outline-none resize-none border-transparent focus:border-[var(--tech-accent)]/20 transition-all leading-relaxed"
              />
              <div className="flex items-center justify-between pt-8 mt-4 border-t border-white/5">
                <div className="flex space-x-6">
                  <button type="button" className="text-zinc-700 hover:text-[var(--tech-accent)] transition-colors"><Globe size={18} /></button>
                  <button type="button" className="text-zinc-700 hover:text-[var(--tech-accent)] transition-colors"><Users size={18} /></button>
                </div>
                <button 
                  disabled={!newPostContent.trim() || isPosting || !auth.currentUser}
                  className="tech-btn tech-btn-active flex items-center space-x-3"
                >
                  {isPosting ? <div className="w-3 h-3 border-t-2 border-black rounded-full animate-spin"></div> : <Send size={14} />}
                  <span>LOG_SPRINT</span>
                </button>
              </div>
            </form>
          </div>

          {/* Post List */}
          <div className="space-y-8">
            {filteredPosts.map((post) => (
              <div key={post.id} className="tech-panel p-8 bg-[var(--tech-inner)] border-[var(--tech-border)] group hover:border-[var(--tech-accent)]/30 transition-all duration-500 relative">
                <div className="absolute top-0 right-0 p-4 font-mono text-[8px] text-zinc-800 tracking-widest uppercase italic">
                  UTC.{new Date().getHours()}:{(new Date().getMinutes()<10?'0':'') + new Date().getMinutes()}
                </div>

                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-black border border-[var(--tech-border)] flex items-center justify-center overflow-hidden tech-panel">
                      {post.authorPhoto ? (
                        <img src={post.authorPhoto} alt={post.authorName} className="w-full h-full object-cover grayscale brightness-125" referrerPolicy="no-referrer" />
                      ) : (
                        <User size={22} className="text-zinc-700" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-black text-[11px] text-white flex items-center space-x-3 uppercase italic tracking-tighter">
                        <span>{post.authorName}</span>
                        <span className="text-[var(--tech-accent)] tech-glow-text">OPERATOR</span>
                      </h4>
                      <div className="flex items-center space-x-2 text-[8px] uppercase font-black font-mono text-[var(--tech-text-dim)] mt-1 tracking-widest italic">
                        <Flame size={10} className="text-[var(--tech-accent)]" />
                        <span>STREAK: {post.streak || 1} CYCLES</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="tech-indent p-6 border-transparent mb-8 bg-[var(--tech-indent-bg)]">
                  <p className="text-[var(--tech-text)] text-[11px] leading-relaxed font-black uppercase tracking-widest whitespace-pre-wrap italic">
                    {post.content}
                  </p>
                </div>

                <div className="flex items-center space-x-10 pt-6 border-t border-[var(--tech-border)]/50">
                  <button 
                    onClick={() => handleLike(post.id)}
                    className="flex items-center space-x-2 text-[var(--tech-text-dim)] hover:text-[var(--tech-accent)] transition-colors group/btn"
                  >
                    <Heart size={16} className={post.likesCount > 0 ? "fill-[var(--tech-accent)] text-[var(--tech-accent)]" : ""} />
                    <span className="text-[10px] font-mono font-black">{post.likesCount || 0}</span>
                  </button>
                  <button className="flex items-center space-x-2 text-[var(--tech-text-dim)] hover:text-[var(--tech-accent)] transition-colors">
                    <MessageCircle size={16} />
                    <span className="text-[10px] font-mono font-black">{post.commentsCount || 0}</span>
                  </button>
                  <button className="ml-auto text-zinc-800 hover:text-white transition-colors">
                    <Share2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            {filteredPosts.length === 0 && (
               <div className="text-center py-20 border border-dashed border-[var(--tech-border)] bg-black/20">
                  <p className="text-[9px] font-black font-mono text-zinc-800 uppercase tracking-[0.4em] italic">Signal_Lost: No remote nodes detected.</p>
               </div>
            )}
          </div>
        </div>

        {/* Sidebar Trending */}
        <div className="hidden lg:block space-y-12">
           <div className="tech-panel p-8 bg-[var(--tech-indent-bg)] border-[var(--tech-border)]">
              <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--tech-accent)] mb-8 flex items-center justify-between tech-glow-text italic">
                <span>Active_Nodes</span>
                <Users size={14} />
              </h3>
              <div className="space-y-6">
                 {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center space-x-4">
                       <div className="w-10 h-10 bg-black border border-[var(--tech-border)] relative tech-panel">
                          <div className="absolute bottom-1 right-1 w-2 h-2 bg-[var(--tech-accent)] rounded-full tech-pulse shadow-[0_0_8px_#4ade80]"></div>
                       </div>
                       <div className="flex-1">
                          <div className="h-1.5 w-32 bg-black/10 mb-2"></div>
                          <div className="h-1 w-16 bg-black/20 opacity-40"></div>
                       </div>
                    </div>
                 ))}
                 <button className="w-full py-3 tech-btn text-[8px] text-[var(--tech-text-dim)] hover:text-[var(--tech-accent)] mt-4">
                    SYNC_DIRECTORY
                 </button>
              </div>
           </div>

           <div className="tech-panel p-8 bg-[var(--tech-indent-bg)] border-[var(--tech-border)]">
              <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--tech-text-dim)] mb-8 flex items-center justify-between italic">
                <span>Hot_Sprints</span>
                <Zap size={14} />
              </h3>
              <div className="space-y-6">
                 {['#DEEP_WORK', '#ARCHITECTURE', '#NEURAL_SYNC'].map(tag => (
                   <div key={tag} className="flex items-center justify-between group cursor-pointer border-b border-[var(--tech-border)]/30 pb-3">
                      <span className="text-[10px] font-black text-[var(--tech-text-dim)] group-hover:text-[var(--tech-accent)] transition-colors tracking-widest italic">{tag}</span>
                      <span className="font-mono text-[9px] text-zinc-800">{(Math.random()*10).toFixed(1)}K_SYNCS</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
