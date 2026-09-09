import React, { useState } from 'react';
import {
  ArrowRight,
  Save,
  Plus,
  Trash2,
  GripVertical,
  MessageSquare,
  Image,
  Film,
  Mic,
  MousePointerClick,
  Users,
  UserCheck,
  UserX,
  Search,
  X,
} from 'lucide-react';
import type { AutomationRuleData, MessageBlockData, AutomationConditionData } from '../../types/automation.js';

interface RuleBuilderProps {
  editingRule: AutomationRuleData | null;
  onSave: () => void;
  onCancel: () => void;
}

type AudienceType = 'all' | 'followers' | 'non_followers';
type KeywordMode = 'contains_any' | 'contains_all' | 'exact_match' | 'none';

export function RuleBuilder({ editingRule, onSave, onCancel }: RuleBuilderProps) {
  const [name, setName] = useState(editingRule?.name || '');
  const [audience, setAudience] = useState<AudienceType>(() => {
    const a = editingRule?.conditions?.find((c) => c.type === 'audience');
    if (!a) return 'all';
    return (a.value?.[0] as AudienceType) || 'all';
  });
  const [keywordMode, setKeywordMode] = useState<KeywordMode>(() => {
    const k = editingRule?.conditions?.find((c) => c.type === 'keyword');
    if (!k || !k.value?.length) return 'none';
    return (k.operator as KeywordMode) || 'contains_any';
  });
  const [keywords, setKeywords] = useState<string[]>(() => {
    const k = editingRule?.conditions?.find((c) => c.type === 'keyword');
    return k?.value || [];
  });
  const [keywordInput, setKeywordInput] = useState('');
  const [messageBlocks, setMessageBlocks] = useState<MessageBlockData[]>(
    editingRule?.actions?.[0]?.messageBlocks || []
  );
  const [saving, setSaving] = useState(false);

  const addKeyword = () => {
    const trimmed = keywordInput.trim();
    if (trimmed && !keywords.includes(trimmed)) {
      setKeywords([...keywords, trimmed]);
      setKeywordInput('');
    }
  };

  const removeKeyword = (kw: string) => {
    setKeywords(keywords.filter((k) => k !== kw));
  };

  const addBlock = (type: MessageBlockData['type']) => {
    const content: MessageBlockData['content'] = {};
    if (type === 'text') content.text = '';
    if (type === 'button') {
      content.buttonText = '';
      content.actionType = 'reply';
      content.response = '';
    }
    setMessageBlocks([...messageBlocks, { type, content }]);
  };

  const updateBlock = (index: number, content: Partial<MessageBlockData['content']>) => {
    const updated = [...messageBlocks];
    updated[index] = { ...updated[index], content: { ...updated[index].content, ...content } };
    setMessageBlocks(updated);
  };

  const removeBlock = (index: number) => {
    setMessageBlocks(messageBlocks.filter((_, i) => i !== index));
  };

  const moveBlock = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= messageBlocks.length) return;
    const updated = [...messageBlocks];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setMessageBlocks(updated);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert('لطفاً نام اتوماسیون را وارد کنید.');
      return;
    }
    if (messageBlocks.length === 0) {
      alert('لطفاً حداقل یک بلوک پیام اضافه کنید.');
      return;
    }

    const conditions: AutomationConditionData[] = [
      { type: 'trigger', value: ['dm_received'] },
      { type: 'audience', value: [audience] },
    ];

    if (keywordMode !== 'none' && keywords.length > 0) {
      conditions.push({
        type: 'keyword',
        operator: keywordMode,
        value: keywords,
      });
    }

    const body = {
      name: name.trim(),
      conditions,
      actions: [{ type: 'send_message', messageBlocks }],
    };

    setSaving(true);
    try {
      const url = editingRule ? `/api/automation/${editingRule.id}` : '/api/automation';
      const method = editingRule ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        onSave();
      } else {
        alert('خطا در ذخیره‌سازی. لطفاً دوباره تلاش کنید.');
      }
    } catch {
      alert('خطا در اتصال به سرور.');
    } finally {
      setSaving(false);
    }
  };

  const blockTypeConfig = {
    text: { icon: MessageSquare, label: 'متن', color: 'text-blue-600 bg-blue-50 border-blue-200' },
    image: { icon: Image, label: 'عکس', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    video: { icon: Film, label: 'ویدیو', color: 'text-purple-600 bg-purple-50 border-purple-200' },
    audio: { icon: Mic, label: 'ویس', color: 'text-amber-600 bg-amber-50 border-amber-200' },
    button: { icon: MousePointerClick, label: 'دکمه', color: 'text-pink-600 bg-pink-50 border-pink-200' },
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={onCancel} className="p-2 -mr-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition">
            <ArrowRight className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-slate-900">
            {editingRule ? 'ویرایش اتوماسیون' : 'ساخت اتوماسیون جدید'}
          </h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 transition disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'در حال ذخیره...' : 'ذخیره اتوماسیون'}
        </button>
      </div>

      {/* Rule Name */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <label className="block text-sm font-semibold text-slate-700 mb-2">نام اتوماسیون</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="مثال: پاسخ قیمت"
          className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition"
        />
      </div>

      {/* When: Trigger */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold">۱</span>
          <h3 className="font-semibold text-slate-800 text-sm">وقتی</h3>
        </div>
        <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-lg border border-slate-200">
          <MessageSquare className="w-4 h-4 text-purple-600" />
          <span className="text-sm text-slate-700">یک نفر به من دایرکت داد</span>
        </div>
      </div>

      {/* Who: Audience */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">۲</span>
          <h3 className="font-semibold text-slate-800 text-sm">برای چه کسی</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { value: 'all' as AudienceType, label: 'همه افراد', icon: Users },
            { value: 'followers' as AudienceType, label: 'فقط فالوورها', icon: UserCheck },
            { value: 'non_followers' as AudienceType, label: 'فقط غیرفالوورها', icon: UserX },
          ].map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.value}
                onClick={() => setAudience(opt.value)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium transition ${
                  audience === opt.value
                    ? 'border-purple-300 bg-purple-50 text-purple-700'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Keywords */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold">۳</span>
          <h3 className="font-semibold text-slate-800 text-sm">شرط کلمه کلیدی (اختیاری)</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <button
            onClick={() => setKeywordMode(keywordMode === 'none' ? 'contains_any' : 'none')}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium transition ${
              keywordMode !== 'none'
                ? 'border-amber-300 bg-amber-50 text-amber-700'
                : 'border-slate-200 text-slate-500 hover:border-slate-300'
            }`}
          >
            <Search className="w-4 h-4" />
            فعال‌سازی فیلتر کلمات
          </button>
          {keywordMode !== 'none' && (
            <select
              value={keywordMode}
              onChange={(e) => setKeywordMode(e.target.value as KeywordMode)}
              className="px-4 py-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-amber-400"
            >
              <option value="contains_any">شامل یکی از کلمات</option>
              <option value="contains_all">شامل همه کلمات</option>
              <option value="exact_match">تطبیق دقیق</option>
            </select>
          )}
        </div>

        {keywordMode !== 'none' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                placeholder="کلمه کلیدی را وارد کنید..."
                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition"
              />
              <button
                onClick={addKeyword}
                className="px-4 py-2.5 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-200 transition"
              >
                افزودن
              </button>
            </div>
            {keywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {keywords.map((kw) => (
                  <span
                    key={kw}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs font-medium"
                  >
                    {kw}
                    <button onClick={() => removeKeyword(kw)} className="text-amber-500 hover:text-amber-700">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Message Builder */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">۴</span>
            <h3 className="font-semibold text-slate-800 text-sm">پاسخ</h3>
          </div>
          <span className="text-xs text-slate-400">{messageBlocks.length} بلوک</span>
        </div>

        {/* Existing Blocks */}
        {messageBlocks.length > 0 && (
          <div className="space-y-3 mb-4">
            {messageBlocks.map((block, index) => {
              const config = blockTypeConfig[block.type];
              const Icon = config.icon;
              return (
                <div key={index} className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded flex items-center justify-center border ${config.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-semibold text-slate-600">{config.label}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveBlock(index, -1)}
                        disabled={index === 0}
                        className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30 transition"
                        title="انتقال به بالا"
                      >
                        <GripVertical className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeBlock(index)}
                        className="p-1 text-slate-400 hover:text-red-500 transition"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    {block.type === 'text' && (
                      <textarea
                        value={block.content.text || ''}
                        onChange={(e) => updateBlock(index, { text: e.target.value })}
                        placeholder="متن پیام را وارد کنید..."
                        rows={3}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition resize-none"
                      />
                    )}
                    {block.type === 'image' && (
                      <div>
                        <input
                          type="text"
                          value={block.content.url || ''}
                          onChange={(e) => updateBlock(index, { url: e.target.value })}
                          placeholder="آدرس تصویر را وارد کنید..."
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-emerald-400 transition"
                        />
                        <div className="mt-2 p-4 border-2 border-dashed border-slate-200 rounded-lg text-center text-xs text-slate-400">
                          <Image className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                          آپلود تصویر (به‌زودی)
                        </div>
                      </div>
                    )}
                    {block.type === 'video' && (
                      <div>
                        <input
                          type="text"
                          value={block.content.url || ''}
                          onChange={(e) => updateBlock(index, { url: e.target.value })}
                          placeholder="آدرس ویدیو را وارد کنید..."
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-purple-400 transition"
                        />
                        <div className="mt-2 p-4 border-2 border-dashed border-slate-200 rounded-lg text-center text-xs text-slate-400">
                          <Film className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                          آپلود ویدیو (به‌زودی)
                        </div>
                      </div>
                    )}
                    {block.type === 'audio' && (
                      <div>
                        <input
                          type="text"
                          value={block.content.url || ''}
                          onChange={(e) => updateBlock(index, { url: e.target.value })}
                          placeholder="آدرس فایل صوتی را وارد کنید..."
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-amber-400 transition"
                        />
                        <div className="mt-2 p-4 border-2 border-dashed border-slate-200 rounded-lg text-center text-xs text-slate-400">
                          <Mic className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                          آپلود فایل صوتی (به‌زودی)
                        </div>
                      </div>
                    )}
                    {block.type === 'button' && (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={block.content.buttonText || ''}
                          onChange={(e) => updateBlock(index, { buttonText: e.target.value })}
                          placeholder="متن دکمه..."
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-pink-400 transition"
                        />
                        <textarea
                          value={block.content.response || ''}
                          onChange={(e) => updateBlock(index, { response: e.target.value })}
                          placeholder="پاسخی که بعد از کلیک روی دکمه ارسال می‌شود..."
                          rows={2}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-pink-400 transition resize-none"
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add Block Buttons */}
        <div className="flex flex-wrap gap-2">
          {(Object.keys(blockTypeConfig) as Array<keyof typeof blockTypeConfig>).map((type) => {
            const config = blockTypeConfig[type];
            const Icon = config.icon;
            return (
              <button
                key={type}
                onClick={() => addBlock(type)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border text-xs font-medium transition hover:shadow-sm ${config.color}`}
              >
                <Plus className="w-3.5 h-3.5" />
                <Icon className="w-3.5 h-3.5" />
                {config.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex items-center justify-between pt-2 pb-8">
        <button
          onClick={onCancel}
          className="px-4 py-2.5 text-slate-600 hover:text-slate-800 text-sm font-medium transition"
        >
          انصراف
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-700 transition disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'در حال ذخیره...' : 'ذخیره اتوماسیون'}
        </button>
      </div>
    </div>
  );
}
