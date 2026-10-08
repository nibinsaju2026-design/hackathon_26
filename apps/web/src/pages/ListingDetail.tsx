import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';

export default function ListingDetail() {
  const { id } = useParams();
  const [listing, setListing] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerPrice, setOfferPrice] = useState('');
  const [pickupPoint, setPickupPoint] = useState('Main Canteen');
  const [pickupDate, setPickupDate] = useState('Today');
  const [pickupTime, setPickupTime] = useState('6:30 PM');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
    
    fetch(`http://localhost:8080/api/listings/${id}`)
      .then(res => res.json())
      .then(data => setListing(data));

    const newSocket = io('http://localhost:8080');
    setSocket(newSocket);

    newSocket.emit('joinListing', id);
    newSocket.on('message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => { newSocket.close(); };
  }, [id]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !socket) return;
    
    const msg = { text: input, senderId: 'me', timestamp: new Date() };
    socket.emit('message', { listingId: id, message: msg });
    setMessages(prev => [...prev, msg]);
    setInput('');
  };

  const submitOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:8080/api/listings/${id}/offers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          price: Number(offerPrice),
          pickupPoint,
          pickupDate,
          pickupTime
        })
      });
      if (res.ok) {
        setShowOfferModal(false);
        const msg = { text: `OFFER MADE: ₹${offerPrice} at ${pickupPoint} on ${pickupDate} ${pickupTime}`, senderId: 'me', timestamp: new Date() };
        socket?.emit('message', { listingId: id, message: msg });
        setMessages(prev => [...prev, msg]);
      } else {
        alert('Failed to make offer');
      }
    } catch (err) {
      alert('Error making offer');
    }
  };

  if (!listing) return (
    <div className="flex items-center justify-center h-[60vh] animate-pulse">
      <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="relative animate-fade-in max-w-6xl mx-auto">
      {showOfferModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="glass-panel p-8 rounded-2xl w-full max-w-md border border-border shadow-2xl relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/20 rounded-full blur-[50px] -z-10 mix-blend-screen"></div>
            <h3 className="text-2xl font-display font-bold mb-6 tracking-tight text-white">Make an Offer</h3>
            <form onSubmit={submitOffer} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Offer Price</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                  <input type="number" value={offerPrice} onChange={e => setOfferPrice(e.target.value)} placeholder="0.00" required className="w-full glass-panel !bg-surface-hover border-border pl-8 pr-4 py-3 rounded-xl focus:outline-none focus:border-primary-500 transition-colors" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Pickup Location</label>
                <input type="text" value={pickupPoint} onChange={e => setPickupPoint(e.target.value)} required className="w-full glass-panel !bg-surface-hover border-border px-4 py-3 rounded-xl focus:outline-none focus:border-primary-500 transition-colors" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Date</label>
                  <input type="text" value={pickupDate} onChange={e => setPickupDate(e.target.value)} required className="w-full glass-panel !bg-surface-hover border-border px-4 py-3 rounded-xl focus:outline-none focus:border-primary-500 transition-colors" />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Time</label>
                  <input type="text" value={pickupTime} onChange={e => setPickupTime(e.target.value)} required className="w-full glass-panel !bg-surface-hover border-border px-4 py-3 rounded-xl focus:outline-none focus:border-primary-500 transition-colors" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowOfferModal(false)} className="px-5 py-2.5 rounded-xl font-medium text-gray-300 hover:text-white hover:bg-surface-hover transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl primary-gradient font-bold shadow-lg text-white transition-all">Send Offer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Details */}
        <div className="lg:col-span-7 space-y-6">
          <div className="h-[400px] glass-panel rounded-2xl overflow-hidden flex items-center justify-center p-2 relative group">
            {listing.imageUrl ? (
              <img src={listing.imageUrl} alt={listing.title} className="w-full h-full object-cover rounded-xl" />
            ) : (
              <div className="w-full h-full bg-surface-hover rounded-xl flex items-center justify-center border border-white/5">
                <span className="text-gray-500 text-lg font-medium">No Image Available</span>
              </div>
            )}
            <div className="absolute top-6 left-6 px-4 py-1.5 bg-black/60 backdrop-blur-md rounded-full text-sm font-semibold border border-white/10 shadow-lg uppercase tracking-wide text-gray-200">
              {listing.category}
            </div>
          </div>
          
          <div className="glass-panel p-8 rounded-2xl">
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-3xl font-display font-bold text-white tracking-tight">{listing.title}</h2>
              <p className="text-3xl font-display font-extrabold text-primary-400">₹{listing.price.toLocaleString('en-IN')}</p>
            </div>
            <div className="flex items-center gap-3 text-sm font-medium text-gray-400 mb-6">
              <span className="px-3 py-1 bg-surface-hover rounded-lg border border-white/5">{listing.condition}</span>
              <span className={`px-3 py-1 rounded-lg border ${listing.availability === 'AVAILABLE' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                {listing.availability}
              </span>
              <span>• Listed 2 hours ago</span>
            </div>
            
            <div className="prose prose-invert prose-p:text-gray-300 max-w-none border-t border-border pt-6">
              <h3 className="text-lg font-semibold text-white mb-3 font-display">Description</h3>
              <p className="leading-relaxed">{listing.description}</p>
            </div>
            
            <div className="mt-8 pt-6 border-t border-border">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">About the Seller</h3>
              <div className="flex items-center gap-4 bg-surface-hover p-4 rounded-xl border border-white/5">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center text-xl font-bold shadow-md text-white">
                  {listing.seller.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-lg text-white">{listing.seller.name}</p>
                    {listing.seller.verified && <span className="bg-blue-500/20 text-blue-400 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold border border-blue-500/30">Verified</span>}
                  </div>
                  <p className="text-sm text-gray-400 mt-0.5">Usually replies in 8 min • Sold 3 items</p>
                </div>
                <button className="ml-auto glass-button px-4 py-2 text-sm font-medium">View Profile</button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Chat & Actions */}
        <div className="lg:col-span-5">
          <div className="flex flex-col h-[650px] glass-panel rounded-2xl overflow-hidden sticky top-28 shadow-2xl border border-border">
            {/* Chat Header */}
            <div className="p-5 border-b border-border bg-surface-hover/50 backdrop-blur-md flex justify-between items-center z-10">
              <div>
                <h3 className="font-semibold text-lg font-display text-white">Negotiation Chat</h3>
                <p className="text-xs text-gray-400">Directly with {listing.seller.name}</p>
              </div>
              {currentUser?.id !== listing.seller.id && (
                <button onClick={() => setShowOfferModal(true)} className="primary-gradient px-4 py-2 rounded-xl text-sm font-bold shadow-lg transition-transform hover:scale-105 active:scale-95">
                  Make Offer
                </button>
              )}
            </div>
            
            {/* Messages Area */}
            <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-4 bg-background/30 custom-scrollbar">
              {messages.length === 0 && (
                <div className="m-auto text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-surface-hover border border-white/5 flex items-center justify-center mx-auto text-gray-500">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                  </div>
                  <p className="text-sm font-medium text-gray-400">Start the conversation</p>
                  <p className="text-xs text-gray-500 max-w-[200px] mx-auto">Messages are end-to-end encrypted and visible only to you.</p>
                </div>
              )}
              {messages.map((m, i) => (
                 <div key={i} className={`max-w-[85%] flex flex-col ${m.senderId === 'me' ? 'self-end items-end' : 'self-start items-start'} animate-slide-up`} style={{ animationDelay: '50ms' }}>
                   <div className={`p-3.5 rounded-2xl shadow-sm ${m.senderId === 'me' ? 'bg-primary-600 text-white rounded-tr-sm' : 'bg-surface-hover text-gray-100 border border-border rounded-tl-sm'}`}>
                     <p className="text-sm leading-relaxed">{m.text}</p>
                     
                     {/* System Offer Injection */}
                     {m.text.startsWith('OFFER MADE:') && (
                       <div className="mt-3 pt-3 border-t border-white/20 flex flex-col gap-2">
                         {currentUser?.id === listing.seller.id ? (
                           <div className="flex gap-2 w-full">
                             <button className="flex-1 bg-green-500 hover:bg-green-600 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-colors shadow-sm" onClick={() => alert('Accepting via /api/offers/:id...')}>Accept Offer</button>
                             <button className="flex-1 bg-surface hover:bg-white/20 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-colors border border-white/10" onClick={() => alert('Counter via /api/offers/:id...')}>Counter</button>
                           </div>
                         ) : (
                           <span className="text-xs font-medium text-primary-200 bg-primary-700/50 px-2 py-1 rounded w-fit">Waiting for seller response...</span>
                         )}
                       </div>
                     )}
                   </div>
                   <span className="text-[10px] text-gray-500 font-medium mt-1 px-1">
                     {m.senderId === 'me' ? 'You' : listing.seller.name} • Just now
                   </span>
                 </div>
              ))}
            </div>
            
            {/* Input Area */}
            <form onSubmit={sendMessage} className="p-4 border-t border-border bg-surface-hover/30 flex gap-3 backdrop-blur-md">
              <input 
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all shadow-inner" 
                placeholder="Type a message..." 
              />
              <button type="submit" disabled={!input.trim()} className="bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:hover:bg-primary-600 px-5 py-3 rounded-xl transition-colors flex items-center justify-center shadow-lg group">
                <svg className="w-5 h-5 text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
