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
    
    const msg = { text: input, senderId: 'me', timestamp: new Date() }; // Mock senderId for now
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

  if (!listing) return <div>Loading...</div>;

  return (
    <div className="relative">
      {showOfferModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md border border-gray-700">
            <h3 className="text-xl font-bold mb-4">Make an Offer</h3>
            <form onSubmit={submitOffer} className="flex flex-col gap-3">
              <input type="number" value={offerPrice} onChange={e => setOfferPrice(e.target.value)} placeholder="Offer Price (₹)" required className="bg-gray-900 border border-gray-700 p-2 rounded" />
              <input type="text" value={pickupPoint} onChange={e => setPickupPoint(e.target.value)} placeholder="Pickup Point" required className="bg-gray-900 border border-gray-700 p-2 rounded" />
              <div className="flex gap-2">
                <input type="text" value={pickupDate} onChange={e => setPickupDate(e.target.value)} placeholder="Date" required className="bg-gray-900 border border-gray-700 p-2 rounded w-1/2" />
                <input type="text" value={pickupTime} onChange={e => setPickupTime(e.target.value)} placeholder="Time" required className="bg-gray-900 border border-gray-700 p-2 rounded w-1/2" />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setShowOfferModal(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-medium">Send Offer</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="h-96 bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center border border-gray-700">
             {listing.imageUrl ? <img src={listing.imageUrl} alt={listing.title} className="w-full h-full object-cover" /> : <span>No Image</span>}
          </div>
          <div className="mt-6">
            <h2 className="text-3xl font-bold">{listing.title}</h2>
            <p className="text-2xl text-blue-400 font-semibold mt-2">₹{listing.price}</p>
            <div className="mt-4 prose prose-invert">
              <p>{listing.description}</p>
            </div>
            
            <div className="mt-8 p-4 bg-gray-800 rounded-lg border border-gray-700">
              <h3 className="font-semibold mb-2">Seller</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-lg">
                  {listing.seller.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium">{listing.seller.name} {listing.seller.verified && <span className="text-blue-400 text-sm ml-1">✓ Verified</span>}</p>
                  <p className="text-sm text-gray-400">Usually replies in 8 min</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col h-[600px] border border-gray-700 rounded-lg overflow-hidden bg-gray-800">
          <div className="p-4 border-b border-gray-700 bg-gray-900 font-semibold flex justify-between items-center">
            <span>Chat with {listing.seller.name}</span>
            {currentUser?.id !== listing.seller.id && (
              <button onClick={() => setShowOfferModal(true)} className="bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded text-sm transition-colors">
                Make Offer
              </button>
            )}
          </div>
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
            {messages.length === 0 && <p className="text-center text-gray-500 my-auto">Start the conversation</p>}
            {messages.map((m, i) => (
               <div key={i} className={`max-w-[80%] p-3 rounded-lg ${m.senderId === 'me' ? 'bg-blue-600 self-end rounded-tr-none' : 'bg-gray-700 self-start rounded-tl-none'}`}>
                 <p>{m.text}</p>
                 {m.text.startsWith('OFFER MADE:') && currentUser?.id === listing.seller.id && (
                   <div className="mt-3 pt-3 border-t border-gray-500/30 flex gap-2">
                     <button className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm font-medium transition-colors" onClick={() => alert('Accepting via /api/offers/:id...')}>Accept</button>
                     <button className="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-sm font-medium transition-colors" onClick={() => alert('Counter via /api/offers/:id...')}>Counter</button>
                   </div>
                 )}
               </div>
            ))}
          </div>
          <form onSubmit={sendMessage} className="p-4 border-t border-gray-700 bg-gray-900 flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              className="flex-1 bg-gray-800 border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-blue-500" 
              placeholder="Type a message..." 
            />
            <button type="submit" className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded transition-colors">Send</button>
          </form>
        </div>
      </div>
    </div>
  );
}
