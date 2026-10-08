import { useState } from 'react';
import { ArrowLeft, ImagePlus, PackagePlus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import useRequireAuth from '../lib/useRequireAuth';
import { useToast } from '../components/ToastProvider';
import { PageHeading } from '../components/UI';

const categories = ['Books', 'Electronics', 'Cycles', 'Hostel Items', 'Furniture', 'Other'];
const conditions = ['Like New', 'Good', 'Fair', 'Well Used'];

async function compressImage(file: File) {
  if (!file.type.startsWith('image/')) throw new Error('Choose an image file.');
  if (file.size > 8 * 1024 * 1024) throw new Error('Image must be smaller than 8 MB.');
  const source = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => { URL.revokeObjectURL(url); resolve(image); };
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read this image.')); };
    image.src = url;
  });
  const scale = Math.min(1, 1400 / Math.max(source.width, source.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(source.width * scale));
  canvas.height = Math.max(1, Math.round(source.height * scale));
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Image processing is unavailable in this browser.');
  context.drawImage(source, 0, 0, canvas.width, canvas.height);
  let quality = 0.78;
  let data = canvas.toDataURL('image/jpeg', quality);
  while (data.length > 760_000 && quality > 0.4) {
    quality -= 0.08;
    data = canvas.toDataURL('image/jpeg', quality);
  }
  if (data.length > 760_000) throw new Error('This image could not be compressed enough. Choose a smaller image.');
  return data;
}

export default function PostListing() {
  const user = useRequireAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Books');
  const [condition, setCondition] = useState('Good');
  const [description, setDescription] = useState('');
  const [hostel, setHostel] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const chooseImage = async (file?: File) => {
    if (!file) return;
    setError('');
    try {
      setImageUrl(await compressImage(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not process that image.');
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const created = await api<{ id: string }>('/api/listings', {
        method: 'POST',
        auth: true,
        body: JSON.stringify({ title: title.trim(), price: Number(price), category, condition, description: description.trim(), imageUrl: imageUrl || undefined, hostel: hostel.trim() || undefined })
      });
      toast('Your item is now listed on campus.');
      navigate(`/listing/${created.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create your listing.');
    } finally {
      setBusy(false);
    }
  };

  if (!user) return null;

  return (
    <div>
      <PageHeading eyebrow="Pass it on" title="Post an item" description="Add a few details and let your campus community find it." action={<Link to="/dashboard" className="button-secondary"><ArrowLeft size={14} /> Dashboard</Link>} />
      <form onSubmit={submit} className="form-card glass-panel">
        <div className="form-grid">
          <label className="form-field span-two"><span className="field-label">Item title</span><input className="field" value={title} onChange={(event) => setTitle(event.target.value)} required minLength={3} maxLength={100} placeholder="e.g. Engineering mathematics textbook" /></label>
          <label className="form-field"><span className="field-label">Price (₹)</span><input className="field" type="number" min="1" step="1" value={price} onChange={(event) => setPrice(event.target.value)} required placeholder="e.g. 450" /></label>
          <label className="form-field"><span className="field-label">Category</span><select className="select-field" value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((value) => <option key={value}>{value}</option>)}</select></label>
          <label className="form-field"><span className="field-label">Condition</span><select className="select-field" value={condition} onChange={(event) => setCondition(event.target.value)}>{conditions.map((value) => <option key={value}>{value}</option>)}</select></label>
          <label className="form-field"><span className="field-label">Hostel / pickup area <span className="muted">(optional)</span></span><input className="field" value={hostel} onChange={(event) => setHostel(event.target.value)} maxLength={80} placeholder="e.g. Women's Hostel" /></label>
          <label className="form-field span-two"><span className="field-label">Description</span><textarea className="textarea-field" value={description} onChange={(event) => setDescription(event.target.value)} required minLength={5} maxLength={2000} placeholder="Share details that will help someone decide. Mention what's included, any wear, or why you're passing it on." /></label>
          <div className="form-field span-two">
            <span className="field-label">Item photo <span className="muted">(optional)</span></span>
            <label className="button-secondary cursor-pointer w-full min-h-[95px] flex-col gap-2 border-dashed">
              <ImagePlus size={20} /> <span>{imageUrl ? 'Choose a different image' : 'Upload an image (up to 8 MB)'}</span>
              <input className="sr-only" type="file" accept="image/*" onChange={(event) => { void chooseImage(event.target.files?.[0]); }} />
            </label>
            {imageUrl && <img className="image-preview mt-3" src={imageUrl} alt="Preview of the item to list" />}
          </div>
          {error && <div className="inline-error span-two" role="alert">{error}</div>}
          <div className="span-two flex flex-col sm:flex-row justify-end gap-3 pt-2">
            <Link className="button-secondary" to="/dashboard">Cancel</Link>
            <button className="button-primary" type="submit" disabled={busy}><PackagePlus size={16} /> {busy ? 'Posting…' : 'Publish listing'}</button>
          </div>
        </div>
      </form>
    </div>
  );
}
