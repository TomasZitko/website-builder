# ⚡ Quick Start: Public Sharing Feature

## 1️⃣ Run Database Migration (2 minutes)

1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Go to **SQL Editor** → **New Query**
3. Copy & paste: `backend/src/db/migrations/add_public_sharing_complete.sql`
4. Click **Run**
5. See success message ✅

## 2️⃣ Update TypeScript Types (30 seconds)

```typescript
// frontend/src/types/website.ts
export interface Website {
  // ... existing fields
  is_public: boolean;  // ← ADD THIS
}
```

## 3️⃣ Add Public Toggle to Dashboard (5 minutes)

```typescript
// In your website card component
<label className="flex items-center gap-2">
  <input
    type="checkbox"
    checked={website.is_public}
    onChange={async (e) => {
      await supabase
        .from('websites')
        .update({ is_public: e.target.checked })
        .eq('id', website.id);
    }}
  />
  <span>{website.is_public ? '🌐 Public' : '🔒 Private'}</span>
</label>
```

## 4️⃣ Create Public Gallery Page (10 minutes)

```typescript
// frontend/src/pages/Gallery.tsx
export function Gallery() {
  const [websites, setWebsites] = useState([]);

  useEffect(() => {
    supabase
      .from('websites')
      .select('*')
      .eq('is_public', true)
      .then(({ data }) => setWebsites(data || []));
  }, []);

  return (
    <div>
      <h1>Public Websites</h1>
      {websites.map(w => (
        <div key={w.id}>
          <h3>{w.name}</h3>
          <iframe srcDoc={w.html_content} />
        </div>
      ))}
    </div>
  );
}
```

## ✅ Done!

**Features now enabled:**
- ✅ Users can toggle websites/chats public or private
- ✅ Public websites visible to everyone
- ✅ Only owner can delete their content
- ✅ Optimized for 10,000+ users

**Read full guide:** [PUBLIC_SHARING_GUIDE.md](./PUBLIC_SHARING_GUIDE.md)
