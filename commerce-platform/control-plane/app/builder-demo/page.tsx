'use client';

import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import {
  ArrowDown, ArrowUp, Download, Eye, FileJson, GripVertical, Image as ImageIcon,
  LayoutTemplate, Monitor, Plus, RotateCcw, Smartphone, Trash2
} from 'lucide-react';

type BlockKind = 'hero' | 'features' | 'text' | 'image' | 'cta';
type Block = {
  id: string;
  kind: BlockKind;
  title: string;
  body: string;
  imageUrl: string;
  buttonLabel: string;
  buttonUrl: string;
  accent: string;
};
type SiteDocument = { version: 1; title: string; blocks: Block[] };
type DragSource = { id: string } | { kind: BlockKind };
type Viewport = 'desktop' | 'mobile';

const STORAGE_KEY = 'motngum.visual-builder-demo.v1';
const MAX_BLOCKS = 30;
const BLOCK_KINDS: BlockKind[] = ['hero', 'features', 'text', 'image', 'cta'];

const KIND_LABELS: Record<BlockKind, string> = {
  hero: 'Ảnh bìa / Hero',
  features: 'Điểm nổi bật',
  text: 'Đoạn giới thiệu',
  image: 'Hình ảnh',
  cta: 'Kêu gọi hành động'
};

const EXAMPLE: SiteDocument = {
  version: 1,
  title: 'Cửa hàng của tôi',
  blocks: [
    {
      id: 'example-hero', kind: 'hero', title: 'Một website, một câu chuyện riêng',
      body: 'Kéo thả từng khối để giới thiệu thương hiệu của bạn theo cách đơn giản nhất.',
      imageUrl: '', buttonLabel: 'Khám phá ngay', buttonUrl: '#gioi-thieu', accent: '#d97706'
    },
    {
      id: 'example-features', kind: 'features', title: 'Điều làm chúng tôi khác biệt',
      body: 'Chất lượng tận tâm\nThiết kế linh hoạt\nChăm sóc chu đáo',
      imageUrl: '', buttonLabel: '', buttonUrl: '', accent: '#d97706'
    },
    {
      id: 'example-text', kind: 'text', title: 'Câu chuyện của thương hiệu',
      body: 'Bạn có thể nhấp vào một khối để sửa tiêu đề, văn bản, màu sắc và liên kết. Thử kéo các khối ở cột bên trái vào trang.',
      imageUrl: '', buttonLabel: '', buttonUrl: '', accent: '#d97706'
    },
    {
      id: 'example-cta', kind: 'cta', title: 'Sẵn sàng bắt đầu?',
      body: 'Để lại dấu ấn riêng với một trang web do chính bạn sắp xếp.',
      imageUrl: '', buttonLabel: 'Liên hệ', buttonUrl: 'https://motngum.cafe', accent: '#d97706'
    }
  ]
};

function makeBlock(kind: BlockKind): Block {
  return {
    id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Date.now()) + String(Math.random()),
    kind,
    title: kind === 'hero' ? 'Tiêu đề nổi bật' : kind === 'features' ? 'Ba điều đặc biệt' : kind === 'image' ? 'Bộ sưu tập' : kind === 'cta' ? 'Liên hệ với chúng tôi' : 'Một câu chuyện mới',
    body: kind === 'features' ? 'Lợi ích đầu tiên\nLợi ích thứ hai\nLợi ích thứ ba' : 'Nhấp vào khối và thay nội dung ở bảng thuộc tính.',
    imageUrl: '',
    buttonLabel: kind === 'hero' || kind === 'cta' ? 'Tìm hiểu thêm' : '',
    buttonUrl: '',
    accent: '#d97706'
  };
}

function safeHttpUrl(value: string): string | null {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? parsed.toString() : null;
  } catch {
    return null;
  }
}

function validateDocument(value: unknown): SiteDocument | null {
  if (!value || typeof value !== 'object') return null;
  const input = value as Record<string, unknown>;
  if (input.version !== 1 || typeof input.title !== 'string' || input.title.length > 120 ||
      !Array.isArray(input.blocks) || input.blocks.length > MAX_BLOCKS) return null;
  const ids = new Set<string>();
  const blocks: Block[] = [];
  for (const raw of input.blocks) {
    if (!raw || typeof raw !== 'object') return null;
    const b = raw as Record<string, unknown>;
    if (typeof b.id !== 'string' || b.id.length < 1 || b.id.length > 100 || ids.has(b.id) ||
        !BLOCK_KINDS.includes(b.kind as BlockKind) ||
        typeof b.title !== 'string' || b.title.length > 160 ||
        typeof b.body !== 'string' || b.body.length > 1200 ||
        typeof b.imageUrl !== 'string' || b.imageUrl.length > 500 ||
        typeof b.buttonLabel !== 'string' || b.buttonLabel.length > 80 ||
        typeof b.buttonUrl !== 'string' || b.buttonUrl.length > 500 ||
        typeof b.accent !== 'string' || !/^#[a-fA-F0-9]{6}$/.test(b.accent)) return null;
    ids.add(b.id);
    blocks.push({
      id: b.id, kind: b.kind as BlockKind, title: b.title, body: b.body,
      imageUrl: b.imageUrl, buttonLabel: b.buttonLabel, buttonUrl: b.buttonUrl, accent: b.accent
    });
  }
  return { version: 1, title: input.title, blocks };
}

function ActionLink({ block, inverse = false }: { block: Block; inverse?: boolean }) {
  if (!block.buttonLabel) return null;
  const href = block.buttonUrl.startsWith('#') && /^#[\w-]+$/.test(block.buttonUrl)
    ? block.buttonUrl : safeHttpUrl(block.buttonUrl);
  const cls = inverse
    ? 'inline-flex rounded-lg bg-white px-5 py-3 font-semibold text-gray-900 shadow-sm'
    : 'inline-flex rounded-lg px-5 py-3 font-semibold text-white shadow-sm';
  if (!href) return <span className={cls} style={inverse ? undefined : { backgroundColor: block.accent }}>{block.buttonLabel}</span>;
  return <a className={cls} style={inverse ? undefined : { backgroundColor: block.accent }}
    href={href} target={href.startsWith('#') ? undefined : '_blank'}
    rel={href.startsWith('#') ? undefined : 'noopener noreferrer'}>{block.buttonLabel}</a>;
}

function BlockPreview({ block }: { block: Block }) {
  if (block.kind === 'hero') {
    return <section className="rounded-2xl bg-gray-950 px-7 py-16 text-center text-white sm:px-12">
      <span className="mb-5 inline-block rounded-full border border-white/25 px-4 py-1 text-xs tracking-widest uppercase">Motngum Builder</span>
      <h2 className="mx-auto max-w-2xl text-3xl font-extrabold tracking-tight sm:text-5xl">{block.title}</h2>
      <p className="mx-auto mt-5 max-w-xl whitespace-pre-line text-sm leading-7 text-gray-300 sm:text-base">{block.body}</p>
      <div className="mt-7"><ActionLink block={block} /></div>
    </section>;
  }
  if (block.kind === 'features') {
    return <section className="py-9">
      <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">{block.title}</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {block.body.split('\n').filter(Boolean).slice(0, 6).map((line, index) =>
          <div key={index} className="rounded-xl border border-gray-200 bg-white p-5 text-center shadow-sm">
            <div className="mx-auto mb-3 flex size-9 items-center justify-center rounded-full text-white" style={{ backgroundColor: block.accent }}>{index + 1}</div>
            <p className="font-medium text-gray-800">{line}</p>
          </div>
        )}
      </div>
    </section>;
  }
  if (block.kind === 'text') {
    return <section id="gioi-thieu" className="mx-auto max-w-3xl py-11 text-center">
      <h2 className="text-2xl font-bold text-gray-900">{block.title}</h2>
      <div className="mx-auto my-5 h-1 w-14 rounded-full" style={{ backgroundColor: block.accent }} />
      <p className="whitespace-pre-line leading-8 text-gray-600">{block.body}</p>
    </section>;
  }
  if (block.kind === 'image') {
    const src = safeHttpUrl(block.imageUrl);
    return <section className="py-6">
      <h2 className="mb-4 text-2xl font-bold text-gray-900">{block.title}</h2>
      {src ? <img src={src} alt={block.title || 'Ảnh nội dung'} loading="lazy"
        className="max-h-[440px] w-full rounded-2xl object-cover" />
        : <div className="flex h-52 items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-100 text-sm text-gray-500">Dán URL ảnh HTTPS ở bảng thuộc tính</div>}
      {block.body ? <p className="mt-3 whitespace-pre-line text-sm leading-6 text-gray-600">{block.body}</p> : null}
    </section>;
  }
  return <section className="rounded-2xl px-7 py-12 text-center text-white" style={{ backgroundColor: block.accent }}>
    <h2 className="text-2xl font-bold">{block.title}</h2>
    <p className="mx-auto mt-3 max-w-xl whitespace-pre-line leading-7 text-white/90">{block.body}</p>
    <div className="mt-6"><ActionLink block={block} inverse /></div>
  </section>;
}

export default function BuilderDemoPage() {
  const [doc, setDoc] = useState<SiteDocument>(EXAMPLE);
  const [hydrated, setHydrated] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(EXAMPLE.blocks[0].id);
  const [viewport, setViewport] = useState<Viewport>('desktop');
  const [preview, setPreview] = useState(false);
  const [status, setStatus] = useState('Đang mở bản nháp...');
  const dragSource = useRef<DragSource | null>(null);
  const importInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const next = validateDocument(JSON.parse(stored));
        if (next) {
          setDoc(next);
          setSelectedId(next.blocks[0]?.id ?? null);
        } else {
          setStatus('Bản lưu cũ không hợp lệ; đã sử dụng mẫu an toàn.');
        }
      }
    } catch {
      setStatus('Không đọc được bản lưu; đã sử dụng mẫu mặc định.');
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(doc));
      setStatus('Đã lưu tự động trong trình duyệt');
    } catch {
      setStatus('Không lưu được trong trình duyệt — hãy xuất JSON để sao lưu.');
    }
  }, [doc, hydrated]);

  const selected = doc.blocks.find(b => b.id === selectedId) ?? null;
  const updateBlock = (patch: Partial<Block>) => {
    if (!selected) return;
    setDoc(current => ({
      ...current,
      blocks: current.blocks.map(block => block.id === selected.id ? { ...block, ...patch } : block)
    }));
  };
  const addBlock = (kind: BlockKind, index = doc.blocks.length) => {
    if (doc.blocks.length >= MAX_BLOCKS) {
      setStatus('Một trang demo tối đa 30 khối.');
      return;
    }
    const block = makeBlock(kind);
    setDoc(current => {
      const next = [...current.blocks];
      next.splice(Math.min(index, next.length), 0, block);
      return { ...current, blocks: next };
    });
    setSelectedId(block.id);
  };
  const removeBlock = (id: string) => {
    setDoc(current => ({ ...current, blocks: current.blocks.filter(b => b.id !== id) }));
    if (selectedId === id) setSelectedId(null);
  };
  const moveBlock = (id: string, direction: number) => {
    setDoc(current => {
      const from = current.blocks.findIndex(b => b.id === id);
      const to = from + direction;
      if (from < 0 || to < 0 || to >= current.blocks.length) return current;
      const next = [...current.blocks];
      const temp = next[from];
      next[from] = next[to];
      next[to] = temp;
      return { ...current, blocks: next };
    });
  };
  const onDropAt = (event: DragEvent<HTMLElement>, index: number) => {
    event.preventDefault();
    const source = dragSource.current;
    dragSource.current = null;
    if (!source) return;
    if ('kind' in source) {
      addBlock(source.kind, index);
      return;
    }
    setDoc(current => {
      const from = current.blocks.findIndex(b => b.id === source.id);
      if (from < 0) return current;
      const next = [...current.blocks];
      const [item] = next.splice(from, 1);
      next.splice(Math.max(0, Math.min(next.length, from < index ? index - 1 : index)), 0, item);
      return { ...current, blocks: next };
    });
  };
  const beginDrag = (event: DragEvent<HTMLElement>, source: DragSource) => {
    dragSource.current = source;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', 'motngum-builder-block');
  };
  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'motngum-builder-draft.json';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const importJSON = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (file.size > 128 * 1024) {
      setStatus('Tệp vượt quá giới hạn 128 KB.');
      return;
    }
    try {
      const next = validateDocument(JSON.parse(await file.text()));
      if (!next) throw new Error('invalid draft');
      setDoc(next);
      setSelectedId(next.blocks[0]?.id ?? null);
      setStatus('Đã nhập bản nháp hợp lệ.');
    } catch {
      setStatus('JSON không đúng định dạng Motngum Builder v1.');
    }
  };
  const reset = () => {
    if (!window.confirm('Khôi phục mẫu mặc định và thay thế bản nháp đang lưu?')) return;
    setDoc(EXAMPLE);
    setSelectedId(EXAMPLE.blocks[0].id);
  };

  return <div className="min-h-screen bg-slate-100 text-slate-900">
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">Motngum Studio · thử nghiệm</p>
          <h1 className="text-xl font-bold">Trình tạo website kéo thả</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setViewport('desktop')} aria-label="Xem trên máy tính"
            className={'rounded-lg border p-2 ' + (viewport === 'desktop' ? 'border-amber-500 bg-amber-50' : 'border-slate-200')}><Monitor size={18}/></button>
          <button onClick={() => setViewport('mobile')} aria-label="Xem trên điện thoại"
            className={'rounded-lg border p-2 ' + (viewport === 'mobile' ? 'border-amber-500 bg-amber-50' : 'border-slate-200')}><Smartphone size={18}/></button>
          <button onClick={() => setPreview(v => !v)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium"><Eye size={16}/>{preview ? 'Chỉnh sửa' : 'Xem trước'}</button>
          <button onClick={exportJSON} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white"><Download size={16}/>Xuất JSON</button>
        </div>
      </div>
    </header>
    <div className="mx-auto max-w-[1600px] px-4 py-4">
      <p role="status" aria-live="polite" className="mb-3 text-xs text-slate-600">
        {status}. Đây là bản demo lưu cục bộ, chưa phát hành website hoặc ghi dữ liệu lên máy chủ.
      </p>
      <div className={'grid gap-4 ' + (preview ? '' : 'xl:grid-cols-[230px_minmax(0,1fr)_290px]')}>
        {!preview && <aside className="self-start rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="mb-2 flex items-center gap-2 font-bold"><LayoutTemplate size={18}/>Thư viện khối</h2>
          <p className="mb-4 text-xs text-slate-500">Kéo khối vào vạch chấm trong trang, hoặc nhấp để thêm ở cuối.</p>
          <div className="space-y-2">
            {BLOCK_KINDS.map(kind => <button type="button" key={kind} draggable
              onDragStart={event => beginDrag(event, { kind })}
              onDragEnd={() => { dragSource.current = null; }}
              onClick={() => addBlock(kind)}
              className="flex w-full cursor-grab items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-3 text-left text-sm hover:border-amber-500 hover:bg-amber-50">
              <span>{KIND_LABELS[kind]}</span><Plus size={15}/>
            </button>)}
          </div>
          <hr className="my-4 border-slate-200"/>
          <button onClick={() => importInput.current?.click()} className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-slate-100"><FileJson size={17}/>Nhập bản nháp JSON</button>
          <input ref={importInput} className="hidden" type="file" accept="application/json,.json" onChange={importJSON}/>
          <button onClick={reset} className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-slate-100"><RotateCcw size={17}/>Khôi phục mẫu</button>
        </aside>}
        <main className="min-w-0">
          <div className={'mx-auto rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-[max-width] sm:p-5 ' +
            (viewport === 'mobile' ? 'max-w-[390px]' : 'max-w-[1000px]')}>
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-4">
              <span className="truncate text-lg font-extrabold">{doc.title || 'Website của tôi'}</span>
              <span className="text-xs text-slate-400">Bản xem trước</span>
            </div>
            {doc.blocks.map((block, index) => <div key={block.id}>
              {!preview && <div onDragOver={event => event.preventDefault()} onDrop={event => onDropAt(event, index)}
                className="group my-2 flex h-5 items-center justify-center rounded-lg border border-dashed border-transparent text-xs text-transparent hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700"
                aria-label={'Thả khối ở vị trí ' + (index + 1)}>Thả khối tại đây</div>}
              <section
                draggable={!preview}
                onDragStart={event => beginDrag(event, { id: block.id })}
                onDragEnd={() => { dragSource.current = null; }}
                onClick={() => !preview && setSelectedId(block.id)}
                aria-label={KIND_LABELS[block.kind]}
                className={'relative rounded-xl ' + (!preview ? 'cursor-pointer border-2 border-transparent p-1 hover:border-amber-300 ' +
                  (selectedId === block.id ? '!border-amber-500' : '') : '')}>
                {!preview && <div className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow">
                  <span title="Kéo để sắp xếp" className="cursor-grab p-1 text-slate-500"><GripVertical size={15}/></span>
                  <button onClick={event => {event.stopPropagation();moveBlock(block.id, -1);}} disabled={index===0} aria-label="Đưa lên" className="rounded p-1 hover:bg-slate-100 disabled:opacity-30"><ArrowUp size={15}/></button>
                  <button onClick={event => {event.stopPropagation();moveBlock(block.id, 1);}} disabled={index===doc.blocks.length-1} aria-label="Đưa xuống" className="rounded p-1 hover:bg-slate-100 disabled:opacity-30"><ArrowDown size={15}/></button>
                  <button onClick={event => {event.stopPropagation();removeBlock(block.id);}} aria-label="Xóa khối" className="rounded p-1 text-red-600 hover:bg-red-50"><Trash2 size={15}/></button>
                </div>}
                <BlockPreview block={block}/>
              </section>
            </div>)}
            {!preview && <div onDragOver={event => event.preventDefault()} onDrop={event => onDropAt(event, doc.blocks.length)}
              className="mt-3 rounded-xl border-2 border-dashed border-slate-300 px-5 py-8 text-center text-sm text-slate-500 hover:border-amber-500 hover:bg-amber-50">
              <Plus size={20} className="mx-auto mb-2"/>Thả một khối mới vào đây
            </div>}
            <footer className="mt-8 border-t border-slate-100 py-5 text-center text-xs text-slate-400">Được dựng bằng Motngum Studio · Bản nháp</footer>
          </div>
        </main>
        {!preview && <aside className="self-start rounded-xl border border-slate-200 bg-white p-4 xl:sticky xl:top-24">
          <h2 className="mb-3 font-bold">Thuộc tính</h2>
          <label className="mb-4 block text-xs font-semibold text-slate-600">Tên website
            <input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" value={doc.title}
              maxLength={120} onChange={event => setDoc(current => ({ ...current, title: event.target.value }))}/>
          </label>
          {selected ? <>
            <p className="mb-4 rounded-lg bg-amber-50 p-2 text-sm text-amber-900">{KIND_LABELS[selected.kind]}</p>
            <label className="mb-3 block text-xs font-semibold text-slate-600">Tiêu đề
              <input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" value={selected.title}
                maxLength={160} onChange={event => updateBlock({title: event.target.value})}/>
            </label>
            <label className="mb-3 block text-xs font-semibold text-slate-600">Nội dung (mỗi dòng là một thẻ nếu chọn Điểm nổi bật)
              <textarea rows={5} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={selected.body} maxLength={1200} onChange={event => updateBlock({body: event.target.value})}/>
            </label>
            {selected.kind === 'image' && <label className="mb-3 block text-xs font-semibold text-slate-600"><ImageIcon size={14} className="inline"/> URL hình ảnh HTTPS
              <input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" value={selected.imageUrl}
                maxLength={500} placeholder="https://example.com/image.jpg" onChange={event => updateBlock({imageUrl: event.target.value})}/>
            </label>}
            {(selected.kind === 'hero' || selected.kind === 'cta') && <>
              <label className="mb-3 block text-xs font-semibold text-slate-600">Nhãn nút
                <input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" value={selected.buttonLabel}
                  maxLength={80} onChange={event => updateBlock({buttonLabel: event.target.value})}/>
              </label>
              <label className="mb-3 block text-xs font-semibold text-slate-600">Liên kết nút (http, https hoặc #gioi-thieu)
                <input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" value={selected.buttonUrl}
                  maxLength={500} onChange={event => updateBlock({buttonUrl: event.target.value})}/>
              </label>
            </>}
            <label className="mb-3 flex items-center justify-between text-xs font-semibold text-slate-600">Màu nhấn
              <input type="color" aria-label="Màu nhấn" value={selected.accent}
                onChange={event => updateBlock({accent: event.target.value})} className="h-10 w-14 cursor-pointer"/>
            </label>
          </> : <p className="text-sm text-slate-500">Chọn một khối trên trang để chỉnh sửa.</p>}
          <p className="mt-5 text-xs leading-5 text-slate-500">Bản thử nghiệm không lưu lên cloud, không có đa người dùng, xuất bản, domain riêng, thương mại hoặc thanh toán.</p>
        </aside>}
      </div>
    </div>
  </div>;
}
