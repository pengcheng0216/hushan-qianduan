import { useState, useEffect, useMemo, useCallback } from "react";

/* ─── 类型定义 ─── */
interface XukeRecord {
  id: string;
  customerName: string;
  village: string;
  phone: string;
  amount: number;
  expireDate: string; // 资金到期日
  productType: string;
  insurancePeriod?: string; // 保险交费期
  followUp: string;
  remark: string;
  createdAt: string;
  createdBy: string;
}

type QueryMode = "day" | "month" | "year" | "custom";
type TabKey = "entry" | "list" | "summary" | "remind" | "export";

/* ─── 邮政绿主题色 ─── */
const COLORS = {
  primary: "#0C6E3A",
  primaryDark: "#095C30",
  primaryLight: "#E8F5EC",
  gold: "#C8A45C",
  goldLight: "#FDF6E3",
  red: "#D4380D",
  redLight: "#FFF1F0",
  bg: "#F4F7F5",
  card: "#FFFFFF",
  text: "#1A1A1A",
  textSecondary: "#666666",
  border: "#D9D9D9",
};

const PRODUCT_TYPES = [
  "绿卡",
  "信用卡",
  "贷款",
  "存款",
  "一次性计收理财",
  "保险（三年交）",
  "保险（五年交）",
];

const VILLAGES = [
 "锦绣花园", "官山社区", "龙河社区", "虎山社区", "虎山驻地","崔景阳村", "桂山头村", "后稍坡村", "后姚沟村", "虎山铺村","日钢打工户", "沿街商贸",
  "黄嘉峪村", "黄泥沟村", "解放村", "连家村", "楼子底村","马家村", "泥田沟村", "前稍坡村", "前水沟村", "秦家结庄村","司门口村", "孙家官庄村", 
  "梭罗树村", "西山村", "夏家村","相家结庄村", "杨庄村", "于家官庄村", "张家结庄村", "郑家结庄村","其他",
];

/* ─── 工具函数 ─── */
function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function daysBetween(d1: string, d2: Date = new Date()) {
  const target = new Date(d1);
  const diff = target.getTime() - d2.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatDate(d: string) {
  return d || "-";
}

function formatMoney(n: number) {
  return n.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/* ─── 邮政Logo SVG ─── */
function PostalLogo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="46" stroke={COLORS.primary} strokeWidth="4" fill={COLORS.primaryLight} />
      <path d="M30 65 L50 25 L70 65 Z" fill={COLORS.primary} opacity="0.85" />
      <path d="M38 65 L50 38 L62 65 Z" fill={COLORS.gold} opacity="0.9" />
      <rect x="35" y="65" width="30" height="6" rx="2" fill={COLORS.primary} />
      <text x="50" y="88" textAnchor="middle" fontSize="10" fill={COLORS.primary} fontWeight="bold">中国邮政</text>
    </svg>
  );
}

/* ─── 主应用 ─── */
export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>("entry");
  const [records, setRecords] = useState<XukeRecord[]>([]);
  const [operatorName, setOperatorName] = useState("");

  // 录入表单
  const [form, setForm] = useState({
    customerName: "",
    village: "",
    phone: "",
    amount: "",
    expireDate: "",
    productType: "",
    insurancePeriod: "",
    followUp: "",
    remark: "",
  });

  // 查询
  const [queryMode, setQueryMode] = useState<QueryMode>("day");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [filterProduct, setFilterProduct] = useState("");
  const [filterVillage, setFilterVillage] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");

  // 编辑
  const [editingId, setEditingId] = useState<string | null>(null);

  // 加载数据
  useEffect(() => {
    const saved = localStorage.getItem("hushan_xuke_records");
    if (saved) {
      try { setRecords(JSON.parse(saved)); } catch {}
    }
    const op = localStorage.getItem("hushan_operator");
    if (op) setOperatorName(op);
  }, []);

  // 保存数据
  useEffect(() => {
    localStorage.setItem("hushan_xuke_records", JSON.stringify(records));
  }, [records]);

  // 录入提交
  const handleSubmit = useCallback(() => {
    if (!form.customerName || !form.village || !form.phone || !form.amount || !form.expireDate || !form.productType) {
      alert("请填写完整必填信息（姓名、村庄、联系方式、金额、到期日、产品类型）");
      return;
    }
    if (editingId) {
      setRecords(prev => prev.map(r => r.id === editingId ? {
        ...r,
        customerName: form.customerName,
        village: form.village,
        phone: form.phone,
        amount: parseFloat(form.amount),
        expireDate: form.expireDate,
        productType: form.productType,
        insurancePeriod: form.insurancePeriod,
        followUp: form.followUp,
        remark: form.remark,
      } : r));
      setEditingId(null);
    } else {
      const newRecord: XukeRecord = {
        id: genId(),
        customerName: form.customerName,
        village: form.village,
        phone: form.phone,
        amount: parseFloat(form.amount),
        expireDate: form.expireDate,
        productType: form.productType,
        insurancePeriod: form.insurancePeriod,
        followUp: form.followUp,
        remark: form.remark,
        createdAt: new Date().toISOString(),
        createdBy: operatorName || "未知",
      };
      setRecords(prev => [newRecord, ...prev]);
    }
    setForm({ customerName: "", village: "", phone: "", amount: "", expireDate: "", productType: "", insurancePeriod: "", followUp: "", remark: "" });
    alert(editingId ? "修改成功！" : "录入成功！");
  }, [form, editingId, operatorName]);

  // 删除
  const handleDelete = useCallback((id: string) => {
    if (confirm("确认删除该条蓄客记录？")) {
      setRecords(prev => prev.filter(r => r.id !== id));
    }
  }, []);

  // 编辑回填
  const handleEdit = useCallback((r: XukeRecord) => {
    setForm({
      customerName: r.customerName,
      village: r.village,
      phone: r.phone,
      amount: r.amount.toString(),
      expireDate: r.expireDate,
      productType: r.productType,
      insurancePeriod: r.insurancePeriod || "",
      followUp: r.followUp,
      remark: r.remark,
    });
    setEditingId(r.id);
    setActiveTab("entry");
  }, []);

  // 查询过滤
  const filteredRecords = useMemo(() => {
    let result = [...records];
    const now = new Date();
    const today = now.toISOString().slice(0, 10);

    if (searchKeyword) {
      const kw = searchKeyword.toLowerCase();
      result = result.filter(r =>
        r.customerName.toLowerCase().includes(kw) ||
        r.village.toLowerCase().includes(kw) ||
        r.phone.includes(kw)
      );
    }
    if (filterProduct) result = result.filter(r => r.productType === filterProduct);
    if (filterVillage) result = result.filter(r => r.village === filterVillage);

    if (queryMode === "day") {
      result = result.filter(r => r.createdAt.slice(0, 10) === today);
    } else if (queryMode === "month") {
      const ym = today.slice(0, 7);
      result = result.filter(r => r.createdAt.slice(0, 7) === ym);
    } else if (queryMode === "year") {
      const y = today.slice(0, 4);
      result = result.filter(r => r.createdAt.slice(0, 4) === y);
    } else if (queryMode === "custom" && customStart && customEnd) {
      result = result.filter(r => r.createdAt.slice(0, 10) >= customStart && r.createdAt.slice(0, 10) <= customEnd);
    }
    return result;
  }, [records, queryMode, customStart, customEnd, filterProduct, filterVillage, searchKeyword]);

  // 到期提醒
  const reminders = useMemo(() => {
    return records
      .map(r => ({ ...r, daysLeft: daysBetween(r.expireDate) }))
      .filter(r => r.daysLeft <= 7 && r.daysLeft >= -30)
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [records]);

  // 汇总统计
  const summary = useMemo(() => {
    const total = filteredRecords.length;
    const totalAmount = filteredRecords.reduce((s, r) => s + r.amount, 0);
    const byProduct: Record<string, { count: number; amount: number }> = {};
    const byVillage: Record<string, { count: number; amount: number }> = {};
    filteredRecords.forEach(r => {
      if (!byProduct[r.productType]) byProduct[r.productType] = { count: 0, amount: 0 };
      byProduct[r.productType].count++;
      byProduct[r.productType].amount += r.amount;
      if (!byVillage[r.village]) byVillage[r.village] = { count: 0, amount: 0 };
      byVillage[r.village].count++;
      byVillage[r.village].amount += r.amount;
    });
    return { total, totalAmount, byProduct, byVillage };
  }, [filteredRecords]);

  // 导出CSV
  const handleExport = useCallback(() => {
    const BOM = "\uFEFF";
    const header = "客户姓名,村庄,联系方式,金额,产品类型,保险交费期,资金到期日,距到期天数,跟进情况,备注,录入时间,录入人\n";
    const rows = filteredRecords.map(r => {
      const d = daysBetween(r.expireDate);
      return `${r.customerName},${r.village},${r.phone},${r.amount},${r.productType},${r.insurancePeriod || "-"},${r.expireDate},${d},${r.followUp || "-"},${r.remark || "-"},${r.createdAt.slice(0, 10)},${r.createdBy}`;
    }).join("\n");
    const blob = new Blob([BOM + header + rows], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `虎山邮政蓄客数据_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredRecords]);

  // Tab配置
  const tabs: { key: TabKey; label: string; icon: string }[] = [
    { key: "entry", label: "蓄客录入", icon: "📝" },
    { key: "list", label: "蓄客查询", icon: "🔍" },
    { key: "summary", label: "汇总统计", icon: "📊" },
    { key: "remind", label: "到期提醒", icon: "🔔" },
    { key: "export", label: "数据导出", icon: "📤" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, fontFamily: "'PingFang SC','Microsoft YaHei',sans-serif" }}>
      {/* ─── 顶部导航 ─── */}
     <header style={{
        background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`,
        color: "#fff", padding: "0 24px", display: "flex", alignItems: "center",
        justifyContent: "space-between", height: 64, boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <PostalLogo size={44} />
          <div>
            <div style={{ fontSize: 20, fontWeight:700, letterSpacing: 1 ,whiteSpace:"nowrap"}}>虎山邮政 · 蓄客管理系统</div>
          </div>
        </div>
        <div style={{
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  width: "100%",
  padding: "0 20px",
}}>
  <div style={{
    display: "inline-flex",
    alignItems: "center",
    background: "rgba(255, 255, 255, 0.18)",
    padding: "4px 14px",
    borderRadius: "8px",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
    backdropFilter: "blur(6px)",
    border: "1px solid rgba(255, 255, 255, 0.25)"
  }}>
    <span style={{
      color: "#fff",
      fontSize: 14,
      fontWeight: 600,
      fontFamily: "Consolas, 'Microsoft YaHei', sans-serif",
      letterSpacing: "1.2px"
    }}>
      {(() => {
        const date = new Date();
        const weekArr = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const week = weekArr[date.getDay()];
        return `${year}/${month}/${day} ${week}`;
      })()}
    </span>
  </div>
</div>
      </header>

      {/* ─── Tab导航 ─── */}
      <nav style={{
        background: COLORS.card, borderBottom: `2px solid ${COLORS.primary}`,
        display: "flex", padding: "0 16px", gap: 0, overflowX: "auto",
      }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            style={{
              padding: "12px 20px", border: "none", background: "transparent",
              cursor: "pointer", fontSize: 14, fontWeight: activeTab === t.key ? 700 : 400,
              color: activeTab === t.key ? COLORS.primary : COLORS.textSecondary,
              borderBottom: activeTab === t.key ? `3px solid ${COLORS.primary}` : "3px solid transparent",
              transition: "all 0.2s", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6,
            }}
          >
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </nav>

      {/* ─── 内容区 ─── */}
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 16px" }}>

        {/* ═══ 蓄客录入 ═══ */}
        {activeTab === "entry" && (
          <div style={{ background: COLORS.card, borderRadius: 12, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div style={{ width: 4, height: 24, background: COLORS.primary, borderRadius: 2 }} />
              <h2 style={{ margin: 0, fontSize: 18, color: COLORS.text }}>{editingId ? "✏️ 修改蓄客信息" : "📝 蓄客信息录入"}</h2>
              <span style={{ fontSize: 12, color: COLORS.textSecondary, background: COLORS.primaryLight, padding: "2px 8px", borderRadius: 4 }}>
                虎山邮政
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {/* 员工姓名 */}
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: COLORS.text, marginBottom: 4 }}>
                  员工姓名 <span style={{ color: COLORS.red }}>*</span>
                </label>
                <input value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })}
                  placeholder="请输入员工姓名"
                  style={inputStyle} />
              </div>

              {/* 客户姓名 */}
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: COLORS.text, marginBottom: 4 }}>
                  客户姓名 <span style={{ color: COLORS.red }}>*</span>
                </label>
                <input value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })}
                  placeholder="请输入客户姓名"
                  style={inputStyle} />
              </div>

              {/* 村庄 */}
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: COLORS.text, marginBottom: 4 }}>
                  村庄 <span style={{ color: COLORS.red }}>*</span>
                </label>
                <select value={form.village} onChange={e => setForm({ ...form, village: e.target.value })}
                  style={inputStyle}>
                  <option value="">请选择村庄</option>
                  {VILLAGES.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>

              {/* 联系方式 */}
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: COLORS.text, marginBottom: 4 }}>
                  联系方式 <span style={{ color: COLORS.red }}>*</span>
                </label>
                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder="手机号码"
                  style={inputStyle} />
              </div>

              {/* 金额 */}
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: COLORS.text, marginBottom: 4 }}>
                  金额（元）<span style={{ color: COLORS.red }}>*</span>
                </label>
                <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
                  placeholder="0.00"
                  style={inputStyle} />
              </div>

              {/* 产品类型 */}
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: COLORS.text, marginBottom: 4 }}>
                  产品类型 <span style={{ color: COLORS.red }}>*</span>
                </label>
                <select value={form.productType} onChange={e => setForm({ ...form, productType: e.target.value })}
                  style={inputStyle}>
                  <option value="">请选择产品类型</option>
                  {PRODUCT_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              {/* 保险交费期 */}
              {form.productType.includes("保险") && (
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: COLORS.text, marginBottom: 4 }}>
                    保险交费期
                  </label>
                  <select value={form.insurancePeriod} onChange={e => setForm({ ...form, insurancePeriod: e.target.value })}
                    style={inputStyle}>
                    <option value="">请选择</option>
                    <option value="三年交">三年交</option>
                    <option value="五年交">五年交</option>
                  </select>
                </div>
              )}

              {/* 资金到期日 */}
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: COLORS.text, marginBottom: 4 }}>
                  资金到期日 <span style={{ color: COLORS.red }}>*</span>
                  <span style={{ fontSize: 11, color: COLORS.red, marginLeft: 6 }}>到期前7/3/1天自动提醒</span>
                </label>
                <input type="date" value={form.expireDate} onChange={e => setForm({ ...form, expireDate: e.target.value })}
                  style={inputStyle} />
              </div>

              {/* 跟进情况 */}
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: COLORS.text, marginBottom: 4 }}>
                  跟进情况
                </label>
                <select value={form.followUp} onChange={e => setForm({ ...form, followUp: e.target.value })}
                  style={inputStyle}>
                  <option value="">请选择</option>
                  <option value="未跟进">未跟进</option>
                  <option value="已电话联系">已电话联系</option>
                  <option value="已上门拜访">已上门拜访</option>
                  <option value="客户有意向">客户有意向</option>
                  <option value="客户暂无意向">客户暂无意向</option>
                  <option value="已办理">已办理</option>
                </select>
              </div>

              {/* 备注 */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: COLORS.text, marginBottom: 4 }}>
                  备注
                </label>
                <textarea value={form.remark} onChange={e => setForm({ ...form, remark: e.target.value })}
                  placeholder="其他补充信息..."
                  rows={3}
                  style={{ ...inputStyle, resize: "vertical" }} />
              </div>
            </div>

            <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
              <button onClick={handleSubmit} style={{
                ...btnPrimary, padding: "10px 32px", fontSize: 15,
              }}>
                {editingId ? "✅ 保存修改" : "📮 提交录入"}
              </button>
              {editingId && (
                <button onClick={() => {
                  setEditingId(null);
                  setForm({ customerName: "", village: "", phone: "", amount: "", expireDate: "", productType: "", insurancePeriod: "", followUp: "", remark: "" });
                }} style={{ ...btnSecondary, padding: "10px 24px" }}>
                  取消编辑
                </button>
              )}
            </div>

            {/* 邮政特色装饰 */}
            <div style={{
              marginTop: 20, padding: "12px 16px", background: COLORS.goldLight,
              borderRadius: 8, borderLeft: `4px solid ${COLORS.gold}`, fontSize: 13, color: "#8B6914",
            }}>
              📮 温馨提示：录入信息后，系统将在资金到期前 <b>7天</b>、<b>3天</b>、<b>1天</b> 自动提醒，请及时跟进客户（仅作为测试）。
            </div>
          </div>
        )}

        {/* ═══ 蓄客查询 ═══ */}
        {activeTab === "list" && (
          <div style={{ background: COLORS.card, borderRadius: 12, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ width: 4, height: 24, background: COLORS.primary, borderRadius: 2 }} />
              <h2 style={{ margin: 0, fontSize: 18, color: COLORS.text }}>🔍 蓄客信息查询</h2>
            </div>

            {/* 筛选栏 */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 16, padding: 16, background: COLORS.bg, borderRadius: 8 }}>
              <input value={searchKeyword} onChange={e => setSearchKeyword(e.target.value)}
                placeholder="搜索姓名/村庄/电话"
                style={{ ...inputStyle, width: 180 }} />
              <select value={filterProduct} onChange={e => setFilterProduct(e.target.value)} style={{ ...inputStyle, width: 150 }}>
                <option value="">全部产品</option>
                {PRODUCT_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <select value={filterVillage} onChange={e => setFilterVillage(e.target.value)} style={{ ...inputStyle, width: 120 }}>
                <option value="">全部村庄</option>
                {VILLAGES.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
              <div style={{ display: "flex", gap: 4 }}>
                {(["day", "month", "year", "custom"] as QueryMode[]).map(m => (
                  <button key={m} onClick={() => setQueryMode(m)} style={{
                    padding: "6px 14px", border: `1px solid ${queryMode === m ? COLORS.primary : COLORS.border}`,
                    borderRadius: 6, background: queryMode === m ? COLORS.primary : "#fff",
                    color: queryMode === m ? "#fff" : COLORS.text, fontSize: 13, cursor: "pointer",
                  }}>
                    {m === "day" ? "今日" : m === "month" ? "本月" : m === "year" ? "本年" : "自定义"}
                  </button>
                ))}
              </div>
              {queryMode === "custom" && (
                <>
                  <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} style={{ ...inputStyle, width: 140 }} />
                  <span style={{ lineHeight: "36px" }}>至</span>
                  <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} style={{ ...inputStyle, width: 140 }} />
                </>
              )}
            </div>

            <div style={{ fontSize: 13, color: COLORS.textSecondary, marginBottom: 8 }}>
              共 <b style={{ color: COLORS.primary }}>{filteredRecords.length}</b> 条记录，
              总金额 <b style={{ color: COLORS.primary }}>¥{formatMoney(filteredRecords.reduce((s, r) => s + r.amount, 0))}</b>
            </div>

            {/* 数据表格 */}
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: COLORS.primaryLight }}>
                    {["客户姓名", "村庄", "联系方式", "金额(元)", "产品类型", "到期日", "距到期", "跟进情况", "录入人", "操作"].map(h => (
                      <th key={h} style={{ padding: "10px 8px", textAlign: "left", borderBottom: `2px solid ${COLORS.primary}`, color: COLORS.primary, fontWeight: 600, whiteSpace: "nowrap" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.length === 0 ? (
                    <tr><td colSpan={10} style={{ padding: 40, textAlign: "center", color: COLORS.textSecondary }}>暂无数据</td></tr>
                  ) : filteredRecords.map(r => {
                    const d = daysBetween(r.expireDate);
                    return (
                      <tr key={r.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                        <td style={{ padding: "8px", fontWeight: 600 }}>{r.customerName}</td>
                        <td style={{ padding: "8px" }}>{r.village}</td>
                        <td style={{ padding: "8px" }}>{r.phone}</td>
                        <td style={{ padding: "8px", color: COLORS.primary, fontWeight: 600 }}>¥{formatMoney(r.amount)}</td>
                        <td style={{ padding: "8px" }}>
                          <span style={{
                            padding: "2px 8px", borderRadius: 4, fontSize: 12,
                            background: r.productType.includes("保险") ? COLORS.goldLight : r.productType.includes("理财") ? "#E6F7FF" : COLORS.primaryLight,
                            color: r.productType.includes("保险") ? "#8B6914" : r.productType.includes("理财") ? "#0050B3" : COLORS.primary,
                          }}>
                            {r.productType}{r.insurancePeriod ? `(${r.insurancePeriod})` : ""}
                          </span>
                        </td>
                        <td style={{ padding: "8px" }}>{formatDate(r.expireDate)}</td>
                        <td style={{ padding: "8px" }}>
                          <span style={{
                            padding: "2px 8px", borderRadius: 4, fontSize: 12, fontWeight: 600,
                            background: d <= 1 ? COLORS.redLight : d <= 3 ? "#FFF7E6" : d <= 7 ? "#E6F7FF" : COLORS.primaryLight,
                            color: d <= 1 ? COLORS.red : d <= 3 ? "#D48806" : d <= 7 ? "#0050B3" : COLORS.primary,
                          }}>
                            {d > 0 ? `${d}天` : d === 0 ? "今天到期" : "已过期"}
                          </span>
                        </td>
                        <td style={{ padding: "8px" }}>{r.followUp || "-"}</td>
                        <td style={{ padding: "8px", fontSize: 12, color: COLORS.textSecondary }}>{r.createdBy}</td>
                        <td style={{ padding: "8px", whiteSpace: "nowrap" }}>
                          <button onClick={() => handleEdit(r)} style={{ ...btnSmall, color: COLORS.primary }}>编辑</button>
                          <button onClick={() => handleDelete(r.id)} style={{ ...btnSmall, color: COLORS.red }}>删除</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══ 汇总统计 ═══ */}
        {activeTab === "summary" && (
          <div style={{ background: COLORS.card, borderRadius: 12, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div style={{ width: 4, height: 24, background: COLORS.primary, borderRadius: 2 }} />
              <h2 style={{ margin: 0, fontSize: 18, color: COLORS.text }}>📊 汇总统计</h2>
            </div>

            {/* 时间筛选 */}
            <div style={{ display: "flex", gap: 4, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
              {(["day", "month", "year", "custom"] as QueryMode[]).map(m => (
                <button key={m} onClick={() => setQueryMode(m)} style={{
                  padding: "6px 16px", border: `1px solid ${queryMode === m ? COLORS.primary : COLORS.border}`,
                  borderRadius: 6, background: queryMode === m ? COLORS.primary : "#fff",
                  color: queryMode === m ? "#fff" : COLORS.text, fontSize: 13, cursor: "pointer",
                }}>
                  {m === "day" ? "今日" : m === "month" ? "本月" : m === "year" ? "本年" : "自定义"}
                </button>
              ))}
              {queryMode === "custom" && (
                <>
                  <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} style={{ ...inputStyle, width: 140 }} />
                  <span>至</span>
                  <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} style={{ ...inputStyle, width: 140 }} />
                </>
              )}
            </div>

            {/* 概览卡片 */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
              <div style={{ padding: 20, borderRadius: 10, background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`, color: "#fff" }}>
                <div style={{ fontSize: 13, opacity: 0.85 }}>蓄客总数</div>
                <div style={{ fontSize: 32, fontWeight: 700, marginTop: 4 }}>{summary.total}</div>
                <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}>条记录</div>
              </div>
              <div style={{ padding: 20, borderRadius: 10, background: `linear-gradient(135deg, ${COLORS.gold}, #B8943F)`, color: "#fff" }}>
                <div style={{ fontSize: 13, opacity: 0.85 }}>蓄客总金额</div>
                <div style={{ fontSize: 28, fontWeight: 700, marginTop: 4 }}>¥{formatMoney(summary.totalAmount)}</div>
                <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}>元</div>
              </div>
              <div style={{ padding: 20, borderRadius: 10, background: `linear-gradient(135deg, #0050B3, #003A8C)`, color: "#fff" }}>
                <div style={{ fontSize: 13, opacity: 0.85 }}>即将到期（7天内）</div>
                <div style={{ fontSize: 32, fontWeight: 700, marginTop: 4 }}>{reminders.filter(r => r.daysLeft >= 0 && r.daysLeft <= 7).length}</div>
                <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}>条需跟进</div>
              </div>
            </div>

            {/* 按产品类型汇总 */}
            <h3 style={{ fontSize: 15, color: COLORS.text, marginBottom: 12 }}>📦 按产品类型汇总</h3>
            <div style={{ overflowX: "auto", marginBottom: 24 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: COLORS.primaryLight }}>
                    <th style={thStyle}>产品类型</th>
                    <th style={thStyle}>笔数</th>
                    <th style={thStyle}>金额(元)</th>
                    <th style={thStyle}>占比</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(summary.byProduct).map(([type, data]) => (
                    <tr key={type} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                      <td style={tdStyle}><span style={{
                        padding: "2px 8px", borderRadius: 4, fontSize: 12,
                        background: type.includes("保险") ? COLORS.goldLight : type.includes("理财") ? "#E6F7FF" : COLORS.primaryLight,
                        color: type.includes("保险") ? "#8B6914" : type.includes("理财") ? "#0050B3" : COLORS.primary,
                      }}>{type}</span></td>
                      <td style={tdStyle}>{data.count}</td>
                      <td style={{ ...tdStyle, color: COLORS.primary, fontWeight: 600 }}>¥{formatMoney(data.amount)}</td>
                      <td style={tdStyle}>{summary.totalAmount > 0 ? (data.amount / summary.totalAmount * 100).toFixed(1) : 0}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 按村庄汇总 */}
            <h3 style={{ fontSize: 15, color: COLORS.text, marginBottom: 12 }}>🏘️ 按村庄汇总</h3>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: COLORS.primaryLight }}>
                    <th style={thStyle}>村庄</th>
                    <th style={thStyle}>笔数</th>
                    <th style={thStyle}>金额(元)</th>
                    <th style={thStyle}>占比</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(summary.byVillage).sort((a, b) => b[1].amount - a[1].amount).map(([village, data]) => (
                    <tr key={village} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                      <td style={tdStyle}>{village}</td>
                      <td style={tdStyle}>{data.count}</td>
                      <td style={{ ...tdStyle, color: COLORS.primary, fontWeight: 600 }}>¥{formatMoney(data.amount)}</td>
                      <td style={tdStyle}>{summary.totalAmount > 0 ? (data.amount / summary.totalAmount * 100).toFixed(1) : 0}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══ 到期提醒 ═══ */}
        {activeTab === "remind" && (
          <div style={{ background: COLORS.card, borderRadius: 12, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div style={{ width: 4, height: 24, background: COLORS.red, borderRadius: 2 }} />
              <h2 style={{ margin: 0, fontSize: 18, color: COLORS.text }}>🔔 到期提醒</h2>
              <span style={{ fontSize: 12, color: COLORS.red, background: COLORS.redLight, padding: "2px 10px", borderRadius: 10 }}>
                {reminders.filter(r => r.daysLeft >= 0).length} 条待跟进
              </span>
            </div>

            <div style={{ padding: 16, background: COLORS.redLight, borderRadius: 8, marginBottom: 20, fontSize: 13, color: COLORS.red }}>
              ⚠️ 系统将在资金到期前 <b>7天</b>、<b>3天</b>、<b>1天</b> 分别发出提醒，请及时联系客户办理续存或转存业务。
            </div>

            {/* 提醒分级 */}
            {[
              { label: "🚨 今天到期 / 已过期", filter: (d: number) => d <= 0, color: COLORS.red, bg: COLORS.redLight },
              { label: "🔴 1天内到期", filter: (d: number) => d === 1, color: COLORS.red, bg: COLORS.redLight },
              { label: "🟠 3天内到期", filter: (d: number) => d > 1 && d <= 3, color: "#D48806", bg: "#FFF7E6" },
              { label: "🔵 7天内到期", filter: (d: number) => d > 3 && d <= 7, color: "#0050B3", bg: "#E6F7FF" },
            ].map(group => {
              const items = reminders.filter(r => group.filter(r.daysLeft));
              if (items.length === 0) return null;
              return (
                <div key={group.label} style={{ marginBottom: 20 }}>
                  <h3 style={{ fontSize: 14, color: group.color, marginBottom: 8, padding: "8px 12px", background: group.bg, borderRadius: 6 }}>
                    {group.label}（{items.length}条）
                  </h3>
                  <div style={{ display: "grid", gap: 8 }}>
                    {items.map(r => (
                      <div key={r.id} style={{
                        padding: 14, border: `1px solid ${group.color}22`, borderRadius: 8,
                        background: group.bg, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 8,
                      }}>
                        <div><span style={{ fontSize: 12, color: COLORS.textSecondary }}>客户</span><br /><b>{r.customerName}</b></div>
                        <div><span style={{ fontSize: 12, color: COLORS.textSecondary }}>村庄</span><br />{r.village}</div>
                        <div><span style={{ fontSize: 12, color: COLORS.textSecondary }}>电话</span><br />{r.phone}</div>
                        <div><span style={{ fontSize: 12, color: COLORS.textSecondary }}>金额</span><br /><b style={{ color: COLORS.primary }}>¥{formatMoney(r.amount)}</b></div>
                        <div><span style={{ fontSize: 12, color: COLORS.textSecondary }}>产品</span><br />{r.productType}</div>
                        <div><span style={{ fontSize: 12, color: COLORS.textSecondary }}>到期日</span><br /><b style={{ color: group.color }}>{formatDate(r.expireDate)}</b></div>
                        <div><span style={{ fontSize: 12, color: COLORS.textSecondary }}>跟进</span><br />{r.followUp || "未跟进"}</div>
                        <div><span style={{ fontSize: 12, color: COLORS.textSecondary }}>录入人</span><br />{r.createdBy}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {reminders.length === 0 && (
              <div style={{ textAlign: "center", padding: 40, color: COLORS.textSecondary }}>
                ✅ 暂无即将到期的蓄客记录
              </div>
            )}
          </div>
        )}

        {/* ═══ 数据导出 ═══ */}
        {activeTab === "export" && (
          <div style={{ background: COLORS.card, borderRadius: 12, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div style={{ width: 4, height: 24, background: COLORS.primary, borderRadius: 2 }} />
              <h2 style={{ margin: 0, fontSize: 18, color: COLORS.text }}>📤 数据导出</h2>
            </div>

            <div style={{ padding: 20, background: COLORS.primaryLight, borderRadius: 10, marginBottom: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.primary, marginBottom: 8 }}>📋 导出说明</div>
              <ul style={{ fontSize: 13, color: COLORS.text, margin: 0, paddingLeft: 20, lineHeight: 2 }}>
                <li>导出格式为 CSV 文件，可用 Excel / WPS 打开</li>
                <li>导出范围与"蓄客查询"页面的筛选条件一致</li>
                <li>可按日/月/年/自定义时间区间筛选后导出</li>
                <li>接入飞书后，数据可自动同步至飞书多维表格</li>
              </ul>
            </div>

            {/* 筛选 */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 20, alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>导出范围：</span>
              {(["day", "month", "year", "custom"] as QueryMode[]).map(m => (
                <button key={m} onClick={() => setQueryMode(m)} style={{
                  padding: "6px 16px", border: `1px solid ${queryMode === m ? COLORS.primary : COLORS.border}`,
                  borderRadius: 6, background: queryMode === m ? COLORS.primary : "#fff",
                  color: queryMode === m ? "#fff" : COLORS.text, fontSize: 13, cursor: "pointer",
                }}>
                  {m === "day" ? "今日" : m === "month" ? "本月" : m === "year" ? "本年" : "自定义"}
                </button>
              ))}
              {queryMode === "custom" && (
                <>
                  <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} style={{ ...inputStyle, width: 140 }} />
                  <span>至</span>
                  <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} style={{ ...inputStyle, width: 140 }} />
                </>
              )}
            </div>

            <div style={{ fontSize: 13, color: COLORS.textSecondary, marginBottom: 16 }}>
              当前筛选结果：<b style={{ color: COLORS.primary }}>{filteredRecords.length}</b> 条记录，
              总金额 <b style={{ color: COLORS.primary }}>¥{formatMoney(filteredRecords.reduce((s, r) => s + r.amount, 0))}</b>
            </div>

            <button onClick={handleExport} style={{
              ...btnPrimary, padding: "12px 40px", fontSize: 16,
            }}>
              📥 导出 CSV 文件
            </button>

            {/* 飞书集成提示 */}
            <div style={{
              marginTop: 24, padding: 16, background: COLORS.goldLight,
              borderRadius: 8, borderLeft: `4px solid ${COLORS.gold}`,
            }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#8B6914", marginBottom: 6 }}>🐦 飞书集成（完整版功能）</div>
              <div style={{ fontSize: 13, color: "#8B6914", lineHeight: 1.8 }}>
                接入飞书后可实现：<br />
                • 前端提交的数据自动同步至飞书多维表格，团队全员可见<br />
                • 到期提醒通过飞书机器人自动推送消息<br />
                • 后台可直接从飞书下载完整数据报表<br />
                • 支持飞书审批流与蓄客跟进流程打通
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ─── 底部 ─── */}
      <footer style={{
        textAlign: "center", padding: "16px", fontSize: 12, color: COLORS.textSecondary,
        borderTop: `1px solid ${COLORS.border}`, background: COLORS.card, marginTop: 20,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 4 }}>
          <PostalLogo size={20} />
          <span>岚山邮政 · 虎山支局</span>
        </div>
        <div>虎山邮政蓄客管理系统 v1.0 | 作者：王鹏程</div>
      </footer>
    </div>
  );
}

/* ─── 样式常量 ─── */
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "8px 12px", border: `1px solid ${COLORS.border}`,
  borderRadius: 6, fontSize: 14, outline: "none", boxSizing: "border-box",
  transition: "border-color 0.2s",
};

const btnPrimary: React.CSSProperties = {
  border: "none", borderRadius: 8, background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`,
  color: "#fff", fontWeight: 600, cursor: "pointer", boxShadow: "0 2px 6px rgba(12,110,58,0.3)",
};

const btnSecondary: React.CSSProperties = {
  border: `1px solid ${COLORS.border}`, borderRadius: 8, background: "#fff",
  color: COLORS.text, cursor: "pointer",
};

const btnSmall: React.CSSProperties = {
  border: "none", background: "transparent", cursor: "pointer",
  fontSize: 12, padding: "2px 8px", textDecoration: "underline",
};

const thStyle: React.CSSProperties = {
  padding: "10px 12px", textAlign: "left", borderBottom: `2px solid ${COLORS.primary}`,
  color: COLORS.primary, fontWeight: 600,
};

const tdStyle: React.CSSProperties = {
  padding: "8px 12px",
};
