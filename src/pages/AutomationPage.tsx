import React, { useEffect, useState, useCallback } from 'react';
import {
  Plus,
  MessageSquare,
  Pencil,
  Trash2,
  Copy,
  ToggleLeft,
  ToggleRight,
  Search,
  Users,
  UserCheck,
  UserX,
  ChevronLeft,
} from 'lucide-react';
import type { AutomationRuleData } from '../../types/automation.js';
import { RuleBuilder } from '../components/automation/RuleBuilder.js';

export function AutomationPage() {
  const [rules, setRules] = useState<AutomationRuleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingRule, setEditingRule] = useState<AutomationRuleData | null>(null);

  const fetchRules = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/automation');
      if (res.ok) {
        const data = await res.json();
        setRules(data.rules || []);
      }
    } catch {
      // empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const handleToggle = async (rule: AutomationRuleData) => {
    try {
      await fetch(`/api/automation/${rule.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !rule.isActive }),
      });
      fetchRules();
    } catch {
      // ignore
    }
  };

  const handleDelete = async (rule: AutomationRuleData) => {
    if (!confirm(`آیا از حذف "${rule.name}" مطمئن هستید؟`)) return;
    try {
      await fetch(`/api/automation/${rule.id}`, { method: 'DELETE' });
      fetchRules();
    } catch {
      // ignore
    }
  };

  const handleDuplicate = async (rule: AutomationRuleData) => {
    try {
      await fetch('/api/automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${rule.name} (کپی)`,
          conditions: rule.conditions,
          actions: rule.actions,
        }),
      });
      fetchRules();
    } catch {
      // ignore
    }
  };

  const handleSave = () => {
    setShowBuilder(false);
    setEditingRule(null);
    fetchRules();
  };

  const getAudienceLabel = (rule: AutomationRuleData) => {
    const audience = rule.conditions.find((c) => c.type === 'audience');
    if (!audience) return 'همه';
    const val = audience.value?.[0];
    if (val === 'followers') return 'فقط فالوورها';
    if (val === 'non_followers') return 'فقط غیرفالوورها';
    return 'همه';
  };

  const getKeywordSummary = (rule: AutomationRuleData) => {
    const keyword = rule.conditions.find((c) => c.type === 'keyword');
    if (!keyword || !keyword.value?.length) return null;
    return keyword.value;
  };

  if (showBuilder) {
    return (
      <RuleBuilder
        editingRule={editingRule}
        onSave={handleSave}
        onCancel={() => {
          setShowBuilder(false);
          setEditingRule(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-purple-600" />
            دایرکت اتوماتیک
          </h1>
          <p className="text-sm text-slate-500 mt-1">مدیریت پاسخ‌های خودکار دایرکت اینستاگرام</p>
        </div>
        <button
          onClick={() => {
            setEditingRule(null);
            setShowBuilder(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          ساخت اتوماسیون جدید
        </button>
      </div>

      {/* Meta API Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <MessageSquare className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-800">وضعیت ارسال پیام خودکار</p>
          <p className="text-xs text-blue-700 mt-1 leading-relaxed">
            ساخت و مدیریت اتوماسیون فعال است. ارسال خودکار پیام در اینستاگرام نیاز به دسترسی ویژه Meta API و پیکربندی وبهوک دارد.
            <span className="font-semibold"> در انتظار فعال‌سازی دسترسی Meta</span>
          </p>
        </div>
      </div>

      {/* Rules List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
              <div className="h-5 bg-slate-100 rounded w-1/3 mb-3" />
              <div className="h-4 bg-slate-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : rules.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-400 mb-4">
            <MessageSquare className="w-8 h-8" />
          </div>
          <h3 className="text-base font-semibold text-slate-700 mb-1">هنوز اتوماسیونی ندارید</h3>
          <p className="text-sm text-slate-500 mb-6 max-w-xs">اولین اتوماسیون دایرکت خود را بسازید تا پاسخ‌های خودکار ارسال شوند.</p>
          <button
            onClick={() => {
              setEditingRule(null);
              setShowBuilder(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 transition"
          >
            <Plus className="w-4 h-4" />
            ساخت اتوماسیون جدید
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {rules.map((rule) => {
            const keywords = getKeywordSummary(rule);
            return (
              <div
                key={rule.id}
                className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-slate-900">{rule.name}</h3>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          rule.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        {rule.isActive ? 'فعال' : 'غیرفعال'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Search className="w-3 h-3" />
                        {keywords && keywords.length > 0 ? (
                          <>
                            اگر پیام شامل
                            {keywords.map((k: string, i: number) => (
                              <span key={i} className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-medium mx-0.5">
                                {k}
                              </span>
                            ))}
                            باشد
                          </>
                        ) : (
                          'برای همه دایرکت‌ها'
                        )}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="flex items-center gap-1">
                        {rule.conditions.find((c) => c.type === 'audience')?.value?.[0] === 'followers' ? (
                          <UserCheck className="w-3 h-3" />
                        ) : rule.conditions.find((c) => c.type === 'audience')?.value?.[0] === 'non_followers' ? (
                          <UserX className="w-3 h-3" />
                        ) : (
                          <Users className="w-3 h-3" />
                        )}
                        {getAudienceLabel(rule)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleToggle(rule)}
                      className={`p-2 rounded-lg transition ${
                        rule.isActive ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-50'
                      }`}
                      title={rule.isActive ? 'غیرفعال کردن' : 'فعال کردن'}
                    >
                      {rule.isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => {
                        setEditingRule(rule);
                        setShowBuilder(true);
                      }}
                      className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                      title="ویرایش"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDuplicate(rule)}
                      className="p-2 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition"
                      title="کپی"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(rule)}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
