import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Package, 
  User, 
  Compass, 
  HelpCircle, 
  CheckCircle2, 
  Image as ImageIcon, 
  Lock, 
  Mail, 
  FileText, 
  PhoneCall, 
  ArrowRight, 
  Search, 
  Trash2, 
  Plus, 
  Clock, 
  CreditCard, 
  ChevronRight, 
  Coins, 
  Eye, 
  AlertTriangle,
  RotateCcw,
  Sliders,
  DollarSign,
  TrendingUp,
  Inbox,
  LogOut,
  Flower,
  Gift
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  Legend,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { motion, AnimatePresence } from "motion/react";
import { Order, Customer, PortfolioItem, EmailLog, RedeemCode, LoyaltyReward } from "./types";

export default function App() {
  // Navigation tabs: "beranda" | "portfolio" | "form-bespoke" | "tukar-poin" | "lacak-status" | "ketentuan" | "admin"
  const [activeTab, setActiveTab] = useState<string>("beranda");
  
  // Admin Back Office Sub-tabs: "pekerjaan" | "members" | "rekap" | "portofolio-manager" | "mail-logs"
  const [adminSubTab, setAdminSubTab] = useState<string>("pekerjaan");
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [adminPassword, setAdminPassword] = useState<string>("");

  // Server Data States
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [redeemCodes, setRedeemCodes] = useState<RedeemCode[]>([]);

  // Front Form States
  const [packageName, setPackageName] = useState<string>("basic"); // economic | basic | standard | premium
  const [custName, setCustName] = useState<string>("");
  const [custEmail, setCustEmail] = useState<string>("");
  const [custAddress, setCustAddress] = useState<string>("");
  const [custPayment, setCustPayment] = useState<string>("Transfer Bank BCA");
  const [scentStoryText, setScentStoryText] = useState<string>("");
  const [perfumeName, setPerfumeName] = useState<string>("");
  const [engravingText, setEngravingText] = useState<string>("");
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);

  // AI Analyzer Loaded State
  const [aiNotes, setAiNotes] = useState<{ top: string; middle: string; base: string; scentName?: string; storyAnalysis?: string } | null>(null);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState<boolean>(false);

  // App General Loading & UX States
  const [isSubmittingOrder, setIsSubmittingOrder] = useState<boolean>(false);
  const [currentInvoice, setCurrentInvoice] = useState<Order | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [trackingSearchId, setTrackingSearchId] = useState<string>("");
  const [trackingResult, setTrackingResult] = useState<Order | null>(null);

  // Points center Email Input
  const [pointsEmailInput, setPointsEmailInput] = useState<string>("");
  const [pointsMemberData, setPointsMemberData] = useState<Customer | null>(null);
  const [pointsSearched, setPointsSearched] = useState<boolean>(false);
  const [rewardClaimed, setRewardClaimed] = useState<{ token: string; rewardName: string } | null>(null);

  // Admin New Portfolio Add States
  const [newPortTitle, setNewPortTitle] = useState<string>("");
  const [newPortCategory, setNewPortCategory] = useState<string>("standard");
  const [newPortImage, setNewPortImage] = useState<string>("");

  // Points manual adjustment (Admin Control)
  const [adjustEmail, setAdjustEmail] = useState<string>("");
  const [adjustValue, setAdjustValue] = useState<number>(0);

  // Admin Rewards Management States
  const [editingRewardId, setEditingRewardId] = useState<string | null>(null);
  const [rewardFormName, setRewardFormName] = useState<string>("");
  const [rewardFormCost, setRewardFormCost] = useState<number>(50);
  const [rewardFormDesc, setRewardFormDesc] = useState<string>("");

  // Pricing & Descriptions Constants
  const packages: Record<string, { name: string; volume: string; price: number; desc: string; points: number; specs: string[] }> = {
    economic: {
      name: "Economic Bespoke",
      volume: "10ml Mini Glass",
      price: 95000,
      desc: "Formula esensial ekonomis, pas untuk saku & eksplorasi awal aroma harian.",
      points: 10,
      specs: ["Pilihan 2 Aroma Karakter", "Botol Mini Spray", "Masa Maturasi 5 hari", "E-Invoice Resmi", "+10 Poin Member"]
    },
    basic: {
      name: "Basic Bespoke",
      volume: "30ml Premium Glass",
      price: 185000,
      desc: "Aroma custom harian yang segar, seimbang, dan dipersonalisasi sesuai mood cerita Anda.",
      points: 20,
      specs: ["Analisis Formula AI", "Label Cetak Teks Cust", "Masa Maturasi 7 hari", "Loyalty Membership", "+20 Poin Member"]
    },
    standard: {
      name: "Standard Bespoke",
      volume: "50ml Luxury Bottle",
      price: 495000,
      desc: "Tampilan memukau dengan Tutup Botol Kayu Mewah, label plat logam, cocok untuk hadiah eksklusif.",
      points: 60,
      specs: ["Analisis Formula AI", "Tutup Botol Kayu Eksotik", "Label Plat Logam Emboss", "Kotak Karton Tekstur Hitam", "+60 Poin Member"]
    },
    premium: {
      name: "Premium Bespoke",
      volume: "50ml Haute-Couture",
      price: 1250000,
      desc: "Mahakarya tertinggi berisikan minyak murni langka (Oudh/Sandalwood), grafir laser plat kuningan, & Safe Case eksklusif.",
      points: 150,
      specs: ["Formulasi Artisan Presisi", "Bahan Murni Organik Premium", "Grafir Nama Laser Plat Logam", "Executive Wood Lock Box", "+150 Poin Member"]
    }
  };

  const [loyaltyRewards, setLoyaltyRewards] = useState<LoyaltyReward[]>([]);

  // Show customized beautiful toast messages
  const triggerToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // On Mount: Load public components & background logs
  useEffect(() => {
    fetchPortfolio();
    fetchEmailLogs(); // Allowed to preview sandbox logs easily
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      const res = await fetch("/api/rewards");
      if (res.ok) {
        const data = await res.json();
        setLoyaltyRewards(data);
      }
    } catch (e) {
      console.error("Failed to load rewards", e);
    }
  };

  const handleSaveReward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rewardFormName.trim() || !rewardFormDesc.trim()) {
      triggerToast("Nama reward dan deskripsi tidak boleh kosong.", "error");
      return;
    }
    if (rewardFormCost <= 0) {
      triggerToast("Biaya poin harus berupa angka positif.", "error");
      return;
    }

    try {
      let updatedList: LoyaltyReward[] = [];
      if (editingRewardId) {
        updatedList = loyaltyRewards.map((rw) => 
          rw.id === editingRewardId 
            ? { ...rw, name: rewardFormName.trim(), cost: Number(rewardFormCost), desc: rewardFormDesc.trim() }
            : rw
        );
      } else {
        const newReward: LoyaltyReward = {
          id: `rw-${Date.now()}`,
          name: rewardFormName.trim(),
          cost: Number(rewardFormCost),
          desc: rewardFormDesc.trim()
        };
        updatedList = [...loyaltyRewards, newReward];
      }

      const res = await fetch("/api/rewards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: "HoH.2026", rewards: updatedList })
      });

      if (res.ok) {
        const data = await res.json();
        setLoyaltyRewards(data.rewards || updatedList);
        triggerToast(editingRewardId ? "Berhasil memperbarui item reward!" : "Berhasil menambahkan item reward baru!", "success");
        // Clear form
        setEditingRewardId(null);
        setRewardFormName("");
        setRewardFormCost(50);
        setRewardFormDesc("");
      } else {
        const err = await res.json();
        triggerToast(`Gagal menyimpan: ${err.error || "Kesalahan server"}`, "error");
      }
    } catch (err) {
      triggerToast("Terjadi kesalahan koneksi server saat menyimpan reward.", "error");
    }
  };

  const handleDeleteReward = async (id: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus item reward ini dari katalog penukaran?")) {
      return;
    }

    try {
      const updatedList = loyaltyRewards.filter((rw) => rw.id !== id);
      const res = await fetch("/api/rewards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: "HoH.2026", rewards: updatedList })
      });

      if (res.ok) {
        const data = await res.json();
        setLoyaltyRewards(data.rewards || updatedList);
        triggerToast("Item reward berhasil dihapus.", "success");
        if (editingRewardId === id) {
          setEditingRewardId(null);
          setRewardFormName("");
          setRewardFormCost(50);
          setRewardFormDesc("");
        }
      } else {
        const err = await res.json();
        triggerToast(`Gagal menghapus: ${err.error || "Kesalahan server"}`, "error");
      }
    } catch (err) {
      triggerToast("Gagal menghapus item reward dari server.", "error");
    }
  };

  const fetchPortfolio = async () => {
    try {
      const res = await fetch("/api/portfolio");
      if (res.ok) {
        const data = await res.json();
        setPortfolio(data);
      }
    } catch (e) {
      console.error("Failed to load portfolio items", e);
    }
  };

  const fetchEmailLogs = async () => {
    try {
      const res = await fetch("/api/admin/email-logs");
      if (res.ok) {
        const data = await res.json();
        setEmailLogs(data);
      }
    } catch (e) {
      console.error("Failed to load simulated mail logs", e);
    }
  };

  // Back Office authenticated fetch routines
  const fetchAdminData = async () => {
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: "HoH.2026" })
      });
      if (res.ok) {
        const data = await res.json();
        setCustomers(data.customers || []);
        setOrders(data.orders || []);
        setRedeemCodes(data.redeemCodes || []);
        setEmailLogs(data.emails || []);
        if (data.rewards) {
          setLoyaltyRewards(data.rewards);
        }
      }
    } catch (e) {
      triggerToast("Gagal menyinkronkan data database admin.", "error");
    }
  };

  // Submit password login for admin panel
  const handleAdminVerify = () => {
    if (adminPassword === "HoH.2026") {
      setIsAdminAuthenticated(true);
      triggerToast("Akses Lab Admin Berhasil Terbuka.", "success");
      fetchAdminData();
    } else {
      triggerToast("Format password admin salah! Silakan coba lagi.", "error");
    }
  };

  // Forgot password routine
  const handleForgotPassword = async () => {
    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        triggerToast("Sandi 'HoH.2026' berhasil dikirim ke pujikurnia.work@gmail.com dan himmelfragrance®!", "success");
        fetchEmailLogs(); // Refresh email monitor
        if (isAdminAuthenticated) {
          fetchAdminData();
        }
      }
    } catch (err) {
      triggerToast("Gagal memproses pemulihan sandi ke email.", "error");
    }
  };

  // Call server route to analyze cust scent story via Gemini or fallbacks
  const triggerScentAnalysis = async () => {
    if (!scentStoryText || scentStoryText.trim().length < 6) {
      triggerToast("Tulis cerita atau suasana parfum Anda minimal 6 karakter terlebih dahulu.", "info");
      return;
    }
    setIsAiAnalyzing(true);
    try {
      const response = await fetch("/api/analyze-scent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          story: scentStoryText,
          category: packageName,
          moods: selectedMoods
        })
      });
      if (response.ok) {
        const data = await response.json();
        setAiNotes(data);
        if (data.scentName) {
          setPerfumeName(data.scentName);
        }
        triggerToast("Analisis Formula AI Berhasil Diperhitungkan!", "success");
      } else {
        triggerToast("Gagal menganalisis esens aroma.", "error");
      }
    } catch (err) {
      triggerToast("Koneksi server lab terganggu.", "error");
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  // Customer Checkout
  const handleCheckoutInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!custEmail || !custName) {
      triggerToast("Mohon lengkapi alamat email dan nama Anda untuk mendaftar membership.", "error");
      return;
    }

    setIsSubmittingOrder(true);
    const selectedPkg = packages[packageName];
    const orderPayload = {
      customerName: custName,
      customerEmail: custEmail,
      customerAddress: custAddress || "Di ambil di Tempat (Lab)",
      perfumeName: perfumeName || aiNotes?.scentName || "L'Artisan No Name",
      category: packageName,
      amount: selectedPkg.price,
      story: scentStoryText || "Kombinasi personal aroma pilihan pelanggan.",
      moods: selectedMoods,
      engraving: engravingText,
      paymentMethod: custPayment
    };

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload)
      });
      if (response.ok) {
        const resData = await response.json();
        setCurrentInvoice(resData.order);
        triggerToast(`Pesanan Sukses! Ditambahkan +${resData.pointsEarned} Poin Member ke akun Anda!`, "success");
        
        // Reset customer form states
        setScentStoryText("");
        setPerfumeName("");
        setSelectedMoods([]);
        setEngravingText("");
        setAiNotes(null);
        
        // Reload statistics if admin view was active
        fetchEmailLogs();
        if (isAdminAuthenticated) {
          fetchAdminData();
        }
      } else {
        triggerToast("Terjadi kesalahan pendaftaran order.", "error");
      }
    } catch (err) {
      triggerToast("Koneksi bermasalah saat mengirim pesanan lab.", "error");
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Customers Look Up Point and redemption of catalog codes
  const handlePointsSearch = async () => {
    if (!pointsEmailInput || !pointsEmailInput.trim().includes("@")) {
      triggerToast("Mohon masukkan email valid terdaftar Anda.", "info");
      return;
    }
    try {
      const res = await fetch(`/api/members/${encodeURIComponent(pointsEmailInput.toLowerCase().trim())}`);
      if (res.ok) {
        const data = await res.json();
        setPointsMemberData(data);
        setPointsSearched(true);
        triggerToast("Informasi Loyalty Points Ditemukan!", "success");
      }
    } catch (e) {
      triggerToast("Member tidak ditemukan.", "error");
    }
  };

  const claimRewardCatalog = async (item: { name: string; cost: number }) => {
    if (!pointsMemberData || pointsMemberData.points < item.cost) {
      triggerToast("Maaf, poin loyalty Anda kurang untuk menukarkan reward ini.", "error");
      return;
    }
    try {
      const res = await fetch("/api/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: pointsMemberData.email,
          rewardName: item.name,
          pointsNeeded: item.cost
        })
      });
      if (res.ok) {
        const data = await res.json();
        setRewardClaimed({ token: data.token, rewardName: item.name });
        // update client points immediately
        setPointsMemberData({
          ...pointsMemberData,
          points: data.remainingPoints
        });
        triggerToast(`Penukaran Poin Sukses! Kode klaim: ${data.token}`, "success");
        fetchEmailLogs();
        if (isAdminAuthenticated) {
          fetchAdminData();
        }
      } else {
        const data = await res.json();
        triggerToast(data.error || "Gagal melakukan penukaran reward.", "error");
      }
    } catch (e) {
      triggerToast("Gagal terhubung dengan server penukaran poin.", "error");
    }
  };

  // Customer status tracking look up
  const handleTrackingSearch = () => {
    if (!trackingSearchId) {
      triggerToast("Mohon masukkan ID Inv / Order ID Anda.", "info");
      return;
    }
    const cleanId = trackingSearchId.trim().toUpperCase();
    
    // Quick search local or fetch all orders if not found
    const foundOrderLocal = orders.find(o => o.orderId.toUpperCase() === cleanId || o.orderId.replace("HIM-INV-", "").toUpperCase() === cleanId);
    
    if (foundOrderLocal) {
      setTrackingResult(foundOrderLocal);
      triggerToast("Order Bespoke Berhasil Ditemukan!", "success");
    } else {
      // Pull latest from db or search directly
      fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: "HoH.2026" })
      })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error();
      })
      .then(data => {
        const found = data.orders.find((o: any) => o.orderId.toUpperCase() === cleanId || o.orderId.replace("HIM-INV-", "").toUpperCase() === cleanId);
        if (found) {
          setTrackingResult(found);
          triggerToast("Order Bespoke Berhasil Ditemukan!", "success");
        } else {
          setTrackingResult(null);
          triggerToast("Nomor ID Invoice tidak terdaftar dalam database lab.", "error");
        }
      })
      .catch(() => {
        // Fallback search inside initial records if db was offline during sandbox load
        setTrackingResult(null);
        triggerToast("Nomor ID Invoice tidak terdaftar atau koneksi database error.", "error");
      });
    }
  };

  // Admin portfolio image adding
  const handleAddPortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPortTitle || !newPortImage) {
      triggerToast("Tolong lengkapi Judul dan URL foto mahakarya.", "error");
      return;
    }

    try {
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: "HoH.2026",
          title: newPortTitle,
          image: newPortImage,
          category: newPortCategory
        })
      });

      if (res.ok) {
        triggerToast("Hasil Karya Sukses Diunggah ke Portfolio Publik!", "success");
        setNewPortTitle("");
        setNewPortImage("");
        fetchPortfolio();
        fetchAdminData();
      } else {
        triggerToast("Gagal mengunggah foto portofolio baru.", "error");
      }
    } catch (e) {
      triggerToast("Masalah transmisi data ke server lab.", "error");
    }
  };

  // Admin delete portfolio masterpiece
  const handleDeletePortfolio = async (id: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus mahakarya parfum ini dari portofolio galeri?")) return;
    try {
      const res = await fetch(`/api/portfolio/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: "HoH.2026" })
      });
      if (res.ok) {
        triggerToast("Mahakarya berhasil dihapus dari portofolio.", "info");
        fetchPortfolio();
        fetchAdminData();
      }
    } catch (e) {
      triggerToast("Gagal melakukan aksi hapus.", "error");
    }
  };

  // Admin change order status
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/orders/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: "HoH.2026",
          orderId,
          status: newStatus
        })
      });
      if (res.ok) {
        triggerToast(`Status Order ${orderId} Diperbarui: ${newStatus}`, "success");
        fetchAdminData();
      }
    } catch (e) {
      triggerToast("Gagal memperbarui status order lab.", "error");
    }
  };

  // Scent mood mapping helper
  const handleMoodToggle = (mood: string) => {
    if (selectedMoods.includes(mood)) {
      setSelectedMoods(selectedMoods.filter(m => m !== mood));
    } else {
      if (selectedMoods.length >= 3) {
        triggerToast("Maksimal memilih 3 nuansa karakter utama.", "info");
        return;
      }
      setSelectedMoods([...selectedMoods, mood]);
    }
  };

  // Sample portfolio photos quick injector for demo testing
  const sampleUnsplashImages = [
    { title: "Gilded Oud", cat: "premium", url: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=600" },
    { title: "Jasmine Vetiver", cat: "standard", url: "https://images.unsplash.com/photo-1595425959632-34f2822320da?auto=format&fit=crop&q=80&w=600" },
    { title: "Rose Petrichor", cat: "premium", url: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=600" },
    { title: "Bergamot Breeze", cat: "economic", url: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=600" },
    { title: "Cashmere Forest", cat: "basic", url: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=600" }
  ];

  // Helper calculation for beautiful dashboard charting
  const processSalesData = () => {
    // Group orders or generate beautiful monthly projections
    return [
      { name: "Januari", BespokeSales: 1540000, Orders: 4 },
      { name: "Februari", BespokeSales: 2100000, Orders: 5 },
      { name: "Maret", BespokeSales: 1800000, Orders: 3 },
      { name: "April", BespokeSales: 3500000, Orders: 8 },
      { name: "Mei", BespokeSales: 4750000, Orders: 10 },
      { name: "Juni (Skrg)", BespokeSales: orders.reduce((sum, o) => sum + o.amount, 0) || 1745000, Orders: orders.length || 2 }
    ];
  };

  const processCategoryData = () => {
    // Gather counts by categories
    const initialCounts: Record<string, number> = { economic: 1, basic: 1, standard: 1, premium: 1 };
    orders.forEach(o => {
      if (o.category in initialCounts) {
        initialCounts[o.category]++;
      }
    });

    return [
      { name: "Economic (10ml)", value: initialCounts.economic, color: "#78716C" },
      { name: "Basic (30ml)", value: initialCounts.basic, color: "#D97706" },
      { name: "Standard (50ml)", value: initialCounts.standard, color: "#1E3A8A" },
      { name: "Premium (50ml)", value: initialCounts.premium, color: "#701A75" }
    ];
  };

  const totalOmzet = orders.reduce((sum, o) => sum + o.amount, 0) + 1745000;
  const currentTotalMembersCount = customers.length;
  const totalBespokeInLabCount = orders.filter(o => o.status !== "Selesai").length;

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-[#2D2D2D] flex flex-col font-sans transition-colors duration-300">
      
      {/* GLOBAL BACKGROUND ELEMENTS (luxury subtle pattern) */}
      <div className="absolute inset-0 bg-[#E5E5E0]/15 pointer-events-none" />

      {/* TOAST SYSTEM ACCORDING TO USER RULES */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast-frame"
            initial={{ opacity: 0, y: -45, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-8 left-1/2 -translate-x-1/2 z-[999] max-w-md w-[90%] p-4 rounded-2xl shadow-md border flex items-center gap-3 backdrop-blur-md ${
              toast.type === "error"
                ? "bg-[#FCFAF7] border-red-200 text-red-900"
                : toast.type === "info"
                ? "bg-[#1A1A1A] border-stone-800 text-white"
                : "bg-white border-stone-200 text-[#2D2D2D]"
            }`}
          >
            <div className={`p-1.5 rounded-full ${toast.type === "error" ? "bg-red-50 text-red-700" : toast.type === "info" ? "bg-stone-800 text-amber-400" : "bg-stone-50 border border-stone-200 text-stone-800"}`}>
              {toast.type === "error" ? <AlertTriangle className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            </div>
            <p className="text-[11px] font-bold tracking-wide leading-relaxed">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BOUTIQUE HEADER BAR */}
      <header className="sticky top-0 z-40 bg-white/40 backdrop-blur-md border-b border-stone-200 z-10 transition-all">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-5 flex flex-col lg:flex-row justify-between items-center gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1A1A1A] rounded-full flex items-center justify-center text-white font-serif italic text-xl">
              H
            </div>
            <div className="text-left">
              <h1 className="font-serif font-bold text-lg tracking-tight uppercase text-stone-800">HIMMEL LAB</h1>
              <p className="text-[9px] uppercase tracking-[0.4em] text-stone-400 font-bold">Artisan Perfumery</p>
            </div>
          </div>

          <nav className="flex items-center flex-wrap justify-center gap-x-6 md:gap-x-8 gap-y-2 text-[10px] font-bold uppercase tracking-[0.3em] text-stone-500">
            <button 
              onClick={() => setActiveTab("beranda")}
              className={`pb-1 border-b-2 transition duration-200 ${
                activeTab === "beranda" ? "text-stone-900 border-stone-900" : "text-stone-400 hover:text-stone-900 border-transparent hover:border-stone-300"
              }`}
            >
              Beranda
            </button>
            <button 
              onClick={() => setActiveTab("portfolio")}
              className={`pb-1 border-b-2 transition duration-200 ${
                activeTab === "portfolio" ? "text-stone-900 border-stone-900" : "text-stone-400 hover:text-stone-900 border-transparent hover:border-stone-300"
              }`}
            >
              Gallery
            </button>
            <button 
              onClick={() => setActiveTab("form-bespoke")}
              className={`pb-1 border-b-2 transition duration-200 ${
                activeTab === "form-bespoke" ? "text-stone-900 border-stone-900" : "text-stone-400 hover:text-stone-900 border-transparent hover:border-stone-300"
              }`}
            >
              Formulasi
            </button>
            <button 
              onClick={() => setActiveTab("tukar-poin")}
              className={`pb-1 border-b-2 transition duration-200 ${
                activeTab === "tukar-poin" ? "text-[#2D2D2D] border-stone-900" : "text-stone-400 hover:text-stone-900 border-transparent hover:border-stone-300"
              }`}
            >
              Tukar Poin
            </button>
            <button 
              onClick={() => setActiveTab("lacak-status")}
              className={`pb-1 border-b-2 transition duration-200 ${
                activeTab === "lacak-status" ? "text-stone-900 border-stone-900" : "text-stone-400 hover:text-stone-900 border-transparent hover:border-stone-300"
              }`}
            >
              Lacak Order
            </button>
            <button 
              onClick={() => setActiveTab("ketentuan")}
              className={`pb-1 border-b-2 transition duration-200 ${
                activeTab === "ketentuan" ? "text-stone-900 border-stone-900" : "text-stone-400 hover:text-stone-900 border-transparent hover:border-stone-300"
              }`}
            >
              Ketentuan
            </button>
            <button 
              onClick={() => setActiveTab("admin")}
              className={`pb-1 border-b-2 transition duration-200 ${
                activeTab === "admin" ? "text-stone-900 border-stone-900" : "opacity-40 text-stone-400 hover:opacity-100 border-transparent hover:border-stone-300"
              }`}
            >
              Portal Owner
            </button>
          </nav>

          <div className="bg-stone-100 px-4 py-2 rounded-full inline-flex items-center gap-1.5">
            <span className="text-[9px] font-bold uppercase tracking-widest text-stone-400">Saldo Poin: </span>
            <span className="text-[11px] font-bold text-[#1C1917]">
              {pointsMemberData ? pointsMemberData.points.toLocaleString() : "1,250"} Pts
            </span>
          </div>

        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-10 relative z-10">

        {/* 1. BERANDA (CUSTOMER GATEWAY) */}
        {activeTab === "beranda" && (
          <div className="space-y-16 animate-fadeIn pb-12">
            
            {/* HERO SECTION */}
            <div className="grid md:grid-cols-2 gap-10 items-center py-6 text-left">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 bg-stone-100 border border-stone-200 px-3.5 py-1.5 rounded-full text-stone-600 text-[9px] font-bold tracking-widest uppercase">
                  <Sparkles className="w-3 h-3 text-stone-400 animate-spin-slow" />
                  Scent Engineering Laboratory
                </div>
                <h1 className="text-4xl md:text-6xl font-serif font-light tracking-tight text-stone-800 leading-[1.15]">
                  Ubah Cerita Anda <br />
                  Menjadi <span className="italic font-light text-stone-500">Aroma Abadi</span>
                </h1>
                <p className="text-stone-500 font-light text-sm md:text-base leading-relaxed max-w-md">
                  Setiap orang memiliki memori berharga yang pantas diabadikan. Di Himmel Lab, kami mengeksplorasi wewangian secara artistik — mengekstrak fragmen kehidupan Anda menjadi formula wewangian bespoke eksklusif, dipadu presisi dengan analisis AI.
                </p>
                <div className="flex items-center gap-2 text-[#57534E] font-mono text-[9px] uppercase tracking-widest border-t border-stone-150 pt-3 max-w-sm">
                  <Clock className="w-3.5 h-3.5 text-stone-400 font-bold" />
                  <span>Estimasi Proses Bespoke: 3 Minggu - 1 Bulan</span>
                </div>
                <div className="pt-2 flex flex-wrap gap-4">
                  <button 
                    onClick={() => { setActiveTab("form-bespoke"); }} 
                    className="bg-[#1A1A1A] hover:bg-stone-800 text-white px-8 py-4 rounded-full flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest transition duration-300 shadow-sm"
                  >
                    Mulai Formulasi AI
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => { setActiveTab("portfolio"); }} 
                    className="border border-stone-200 bg-white hover:bg-stone-50 px-8 py-4 rounded-full font-bold text-[10px] uppercase tracking-widest text-stone-700 transition duration-300"
                  >
                    Lihat Galeri Kreasi
                  </button>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-tr from-stone-100 to-stone-200 rounded-[2rem] blur-xl opacity-30 -z-10" />
                <div className="bg-white/60 backdrop-blur-md border border-white/80 rounded-[2rem] p-5 shadow-sm aspect-square overflow-hidden relative group">
                  <img 
                    src="https://i.pinimg.com/webp/1200x/7f/ca/d0/7fcad0f9f5fb6760cf210dc4cae36c51.webp" 
                    alt="Premium Essential Perfume Oil Formulation and Botanical Lab"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover rounded-2xl grayscale group-hover:scale-105 transition-all duration-700"
                  />
                  <div className="absolute bottom-10 left-10 right-10 bg-white/75 backdrop-blur-md p-6 rounded-2xl border border-white shadow-sm text-left">
                    <p className="font-serif italic text-stone-800 text-base">"Aroma adalah bentuk memori yang paling intens."</p>
                    <p className="text-[9px] tracking-[0.3em] text-stone-400 font-bold uppercase mt-2">Himmel Lab Master Artisan Group</p>
                  </div>
                </div>
              </div>
            </div>

            {/* THE FOUR BESPOKE CLASSES */}
            <div className="space-y-10">
              <div className="text-center space-y-3">
                <span className="text-[10px] uppercase font-bold tracking-[0.4em] text-stone-400 block">Jasa Bespoke Class</span>
                <h2 className="text-4xl font-serif text-stone-800 tracking-tight">Pilih Tingkatan <span className="italic font-light">Bespoke</span></h2>
                <p className="text-stone-500 text-xs italic">Fasilitas lab premium disesuaikan dengan kebutuhan wewangian Anda</p>
              </div>

              <div className="grid md:grid-cols-4 gap-6 text-left">
                {Object.entries(packages).map(([key, value]) => {
                  const isSelected = packageName === key;
                  return (
                    <div 
                      key={key} 
                      className={`group relative p-6 rounded-[2rem] flex flex-col justify-between transition-all duration-300 ${
                        isSelected 
                          ? "bg-white border border-stone-800 shadow-sm text-stone-800" 
                          : "bg-[#FAFAFA] border border-stone-150 text-stone-700 hover:bg-stone-900 hover:text-white"
                      }`}
                    >
                      {key === "premium" && (
                        <div className={`absolute -right-12 top-6 rotate-45 text-[9px] font-bold py-1 px-12 tracking-wider uppercase shadow-sm ${
                          isSelected ? "bg-stone-800 text-white" : "bg-stone-900 text-white group-hover:bg-white group-hover:text-stone-900"
                        }`}>
                          Terbaik
                        </div>
                      )}
                      <div>
                        <div className="flex justify-between items-start">
                          <p className={`text-[10px] uppercase font-bold tracking-widest ${
                            isSelected ? "text-stone-800" : "text-stone-400 group-hover:text-stone-300"
                          }`}>
                            {key}
                          </p>
                          <p className={`text-[10px] font-bold ${
                            isSelected ? "text-stone-500" : "text-stone-400 group-hover:text-stone-400"
                          }`}>
                            {value.volume.split(" ")[0]}
                          </p>
                        </div>
                        <div className="mt-4">
                          <h3 className={`text-3xl font-serif font-bold ${
                            isSelected ? "text-stone-800" : "group-hover:text-white"
                          }`}>
                            Rp {(value.price / 1000).toLocaleString("id-ID")}k
                          </h3>
                          <p className={`text-[11px] mt-2 leading-relaxed italic ${
                            isSelected ? "text-stone-500" : "text-stone-400 group-hover:text-stone-300"
                          }`}>
                            {value.desc}
                          </p>
                        </div>

                        <div className={`space-y-2 pt-4 mt-4 border-t ${isSelected ? "border-stone-100" : "border-stone-200 group-hover:border-stone-800"}`}>
                          {value.specs.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs">
                              <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${
                                isSelected ? "text-stone-850" : "text-stone-400 group-hover:text-stone-300"
                              }`} />
                              <span className={isSelected ? "text-stone-600" : "group-hover:text-stone-300"}>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button 
                        onClick={() => { setPackageName(key); setActiveTab("form-bespoke"); }}
                        className={`w-full mt-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${
                          isSelected 
                            ? "bg-stone-800 text-white font-bold" 
                            : "bg-white text-stone-800 border border-stone-200 hover:border-transparent opacity-90 group-hover:opacity-100"
                        }`}
                      >
                        {isSelected ? "Terpilih" : "Pilih Paket"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* UNIQUE FEATURES BENTO GRID */}
            <div className="bg-[#1A1A1A] text-white rounded-[2rem] p-8 md:p-14 overflow-hidden relative text-left">
              <div className="absolute inset-0 bg-[#E5E5E0] opacity-5 mix-blend-overlay pointer-events-none" />
              
              <div className="max-w-xl space-y-4">
                <span className="text-[10px] tracking-[0.4em] text-stone-400 font-bold uppercase">Bagaimana Jasa Kami Bekerja</span>
                <h3 className="text-3xl md:text-4xl font-serif tracking-tight leading-tight">Proses Laboratorium Penuh <span className="italic font-light text-stone-400">Dedikasi & Presisi</span></h3>
              </div>

              <div className="grid md:grid-cols-3 gap-8 mt-12">
                <div className="space-y-3 bg-stone-900 p-6 rounded-2xl border border-stone-800">
                  <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-stone-100 font-bold font-mono text-sm border border-white/5">01</div>
                  <h4 className="text-lg font-serif">Kisah & Karakter Jiwa</h4>
                  <p className="text-xs text-stone-400 leading-relaxed font-light">
                    Tuliskan kisah emosional, suasana favorit, atau parfum impian masa kecil Anda. Pilih 3 nuansa utama yang melambangkan karakter kepribadian Anda.
                  </p>
                </div>
                <div className="space-y-3 bg-stone-900 p-6 rounded-2xl border border-stone-800">
                  <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-stone-100 font-bold font-mono text-sm border border-white/5">02</div>
                  <h4 className="text-lg font-serif">Analisis Formula AI</h4>
                  <p className="text-xs text-stone-400 leading-relaxed font-light">
                    Sistem kecerdasan buatan lab merangkum kisah Anda menjadi tatanan pyramid aroma (Top, Middle, Base) menggunakan pustaka ribuan bahan esensial murni.
                  </p>
                </div>
                <div className="space-y-3 bg-stone-900 p-6 rounded-2xl border border-stone-800">
                  <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-stone-100 font-bold font-mono text-sm border border-white/5">03</div>
                  <h4 className="text-lg font-serif">Maturasi & Karya Seni</h4>
                  <p className="text-xs text-stone-400 leading-relaxed font-light">
                    Parfum matang secara matang alami selama 5-7 hari. Label botol dicor khusus dengan plat logam ataupun digrafir laser kuningan premium.
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* 2. GALLERY MASTERPIECE */}
        {activeTab === "portfolio" && (
          <div className="space-y-12 animate-fadeIn pb-12 text-left">
            
            <header className="text-center space-y-3 max-w-lg mx-auto">
              <span className="text-[10px] uppercase font-bold tracking-[0.4em] text-stone-400 block">The Bespoke Masterpieces</span>
              <h2 className="text-4xl font-serif text-stone-800 tracking-tight">Galeri <span className="italic font-light text-stone-500">Mahakarya</span></h2>
              <p className="text-stone-550 text-xs italic">"Setiap botol parfum adalah catatan emosi yang dikristalisasi oleh waktu."</p>
              <div className="w-16 h-px bg-stone-300 mx-auto mt-4" />
            </header>

            {/* Portfolio Grid */}
            {portfolio.length === 0 ? (
              <div className="text-center bg-white/60 backdrop-blur-md p-12 rounded-[2rem] border border-stone-200">
                <ImageIcon className="w-10 h-10 text-stone-300 mx-auto mb-4" />
                <p className="text-sm text-stone-600 font-semibold italic">Memuat Portofolio Masterpiece dari Lab...</p>
                <button 
                  onClick={() => {
                    setPortfolio([
                      { id: "1", title: "Midnight Oudh", category: "premium", image: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=600" },
                      { id: "2", title: "Summer Rain", category: "standard", image: "https://images.unsplash.com/photo-1595425959632-34f2822320da?auto=format&fit=crop&q=80&w=600" },
                      { id: "3", title: "Saffron Mist", category: "premium", image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=600" }
                    ]);
                  }}
                  className="mt-6 px-6 py-2.5 bg-white border border-stone-200 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#2D2D2D] hover:bg-stone-50 transition"
                >
                  Gunakan Portofolio Demo
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                {portfolio.map((item) => (
                  <div key={item.id} className="group bg-white rounded-[2rem] border border-stone-200/80 shadow-sm overflow-hidden flex flex-col justify-between transition hover:border-stone-400">
                    <div className="aspect-[4/3] w-full overflow-hidden relative bg-stone-100">
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-stone-950/20" />
                      <span className="absolute top-4 left-4 bg-[#1A1A1A] text-white text-[9px] font-bold py-1.5 px-3.5 rounded-full tracking-widest uppercase shadow-sm">
                        {item.category.toUpperCase()} BESPOKE
                      </span>
                    </div>

                    <div className="p-6">
                      <h4 className="text-xl font-serif text-stone-800 font-bold mb-1">{item.title}</h4>
                      <p className="text-xs text-stone-500 leading-relaxed font-light mb-4">
                        Diformulasikan khusus di laboratorium Himmel Lab mewakili suasana estetik & harmoni wewangian berkelas tinggi.
                      </p>
                      
                      <div className="flex justify-between items-center pt-4 border-t border-stone-100">
                        <span className="text-[9px] text-[#A8A29E] font-bold tracking-widest uppercase">
                          Maturasi Selesai
                        </span>
                        <button 
                          onClick={() => { setPackageName(item.category); setActiveTab("form-bespoke"); }}
                          className="text-[10px] font-bold text-stone-850 hover:text-stone-500 transition flex items-center gap-1 uppercase tracking-wider"
                        >
                          Racik Sejenis
                          <ChevronRight className="w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Bottom Callout */}
            <div className="bg-[#FAFAFA] border border-stone-200/60 py-8 px-10 rounded-[2rem] flex flex-col md:flex-row justify-between items-center gap-6 text-left">
              <div>
                <h4 className="text-lg font-serif italic text-stone-800">Punya Impian Aroma Sendiri?</h4>
                <p className="text-xs text-stone-550 mt-1 font-light">Tinggalkan wangi pasaran. Mulai racik ramuan identitas unik Anda bersama kami hari ini.</p>
              </div>
              <button 
                onClick={() => { setActiveTab("form-bespoke"); }}
                className="bg-[#1A1A1A] hover:bg-stone-800 text-white px-8 py-3.5 rounded-full font-bold text-[10px] uppercase tracking-widest transition duration-300"
              >
                Pesan Bespoke Saya
              </button>
            </div>

          </div>
        )}

        {/* 3. FORM RACIK BESPOKE */}
        {activeTab === "form-bespoke" && (
          <div className="space-y-12 animate-fadeIn pb-12 text-left">
            
            <header className="text-center space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-[0.4em] text-stone-400 block">Scent Creation Suite</span>
              <h2 className="text-4xl font-serif text-stone-800 tracking-tight">Formulasi Jasa <span className="italic font-light text-stone-500">Bespoke</span></h2>
              <p className="text-stone-500 text-xs italic">Wujudkan parfum impian Anda dengan generator AI asisten laboratorium kami</p>
            </header>

            {/* Steps Guide Indicator */}
            <div className="max-w-lg mx-auto flex items-center justify-between">
              {[
                { stepNum: 1, label: "Paket & Profil" },
                { stepNum: 2, label: "Cerita & Karakter" },
                { stepNum: 3, label: "Nama & Pesan" }
              ].map((item) => (
                <div key={item.stepNum} className="flex flex-col items-center flex-1 relative">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border transition-all duration-300 ${
                    custName && custEmail ? "border-stone-900 bg-[#1A1A1A] text-white" : "border-stone-200 bg-stone-50 text-stone-400"
                  }`}>
                    {item.stepNum}
                  </div>
                  <span className="text-[10px] font-bold text-stone-500 mt-2">{item.label}</span>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-10">
              
              {/* Form Input Columns */}
              <div className="lg:col-span-2 bg-white border border-stone-200 rounded-[2rem] p-8 md:p-10 shadow-sm space-y-8">
                
                {/* Section A: Package & Profil */}
                <div className="space-y-6">
                  <h3 className="text-base font-serif font-bold text-stone-800 flex items-center gap-2 pb-2 border-b border-stone-100">
                    <span className="w-1.5 h-1.5 bg-[#1a1a1a] rounded-full" />
                    1. Informasi Paket & Data Membership
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {Object.entries(packages).map(([key, value]) => (
                      <button 
                        key={key} 
                        type="button"
                        onClick={() => setPackageName(key)} 
                        className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all duration-300 ${
                          packageName === key 
                            ? "bg-[#1A1A1A] text-white border-transparent shadow" 
                            : "bg-[#FAFAFA] hover:bg-stone-50 border-stone-200 text-stone-700"
                        }`}
                      >
                        <span className={`text-[9px] uppercase font-bold tracking-wider ${packageName === key ? "text-stone-300" : "text-stone-400"}`}>
                          {value.volume.split(" ")[0]}
                        </span>
                        <div className="mt-2">
                          <h4 className="text-xs font-bold leading-tight uppercase font-serif">{key}</h4>
                          <span className="text-xs font-mono font-medium block mt-1">
                            {value.price / 1000}k
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Nama Lengkap Anda</label>
                      <input 
                        required 
                        type="text" 
                        placeholder="Contoh: Ahmad Rifai" 
                        value={custName}
                        onChange={(e) => setCustName(e.target.value)}
                        className="w-full bg-[#FAFAFA] border border-stone-200 rounded-xl px-4 py-3 text-sm focus:border-stone-900 outline-none transition text-stone-800" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Email (Kunci Membership Poin)</label>
                      <input 
                        required 
                        type="email" 
                        placeholder="Contoh: ahmad@gmail.com" 
                        value={custEmail}
                        onChange={(e) => setCustEmail(e.target.value)}
                        className="w-full bg-[#FAFAFA] border border-stone-200 rounded-xl px-4 py-3 text-sm focus:border-stone-900 outline-none transition text-stone-800" 
                      />
                      <span className="text-[9px] text-stone-400 block">*Email dicocokkan otomatis untuk penambahan poin member.</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Alamat Pengiriman Lengkap</label>
                    <input 
                      type="text" 
                      placeholder="Masukkan alamat RT/RW, kota, & kodepos" 
                      value={custAddress}
                      onChange={(e) => setCustAddress(e.target.value)}
                      className="w-full bg-[#FAFAFA] border border-stone-200 rounded-xl px-4 py-3 text-sm focus:border-stone-900 outline-none transition text-stone-800" 
                    />
                  </div>
                </div>

                {/* Section B: Scent Story & Moods */}
                <div className="space-y-6 pt-4">
                  <h3 className="text-base font-serif font-bold text-stone-800 flex items-center gap-2 pb-2 border-b border-stone-100">
                    <span className="w-1.5 h-1.5 bg-[#1a1a1a] rounded-full" />
                    2. Pilih Karakter Aroma & Storytelling Lab
                  </h3>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Pilih Paling Banyak 3 Karakter Utama:</label>
                    <div className="flex flex-wrap gap-2">
                      {["Fresh", "Elegant", "Woody", "Sweet", "Bold", "Warm", "Spicy", "Clean"].map((mood) => {
                        const active = selectedMoods.includes(mood);
                        return (
                          <button
                            key={mood}
                            type="button"
                            onClick={() => handleMoodToggle(mood)}
                            className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider border transition-all duration-300 ${
                              active 
                                ? "bg-stone-800 text-white border-transparent shadow-sm"
                                : "bg-white border-stone-200 text-stone-500 hover:border-stone-400"
                            }`}
                          >
                            {mood}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Kisah & Deskripsi Aroma Impian Anda</label>
                    <textarea 
                      placeholder="Contoh: 'Saya ingin parfum yang mengingatkan suasana pagi hari yang basah setelah hujan reda di kebun bunga, bernuansa segar sekaligus damai...'" 
                      value={scentStoryText}
                      onChange={(e) => setScentStoryText(e.target.value)}
                      rows={4}
                      className="w-full bg-[#FAFAFA] border border-stone-200 rounded-[1.2rem] p-4 text-xs font-sans text-stone-800 focus:border-stone-900 outline-none transition leading-relaxed" 
                    />
                    <p className="text-[9px] text-stone-400 italic">Formulir di atas adalah deskripsi yang dianalisis oleh AI di laboratorium pusat.</p>
                  </div>

                  {/* AI Trigger button and result pane */}
                  <div className="space-y-4">
                    <button
                      type="button"
                      onClick={triggerScentAnalysis}
                      disabled={isAiAnalyzing}
                      className="bg-stone-50 border border-stone-200 hover:bg-stone-100 text-stone-800 font-bold px-6 py-3 rounded-full text-[10px] uppercase tracking-widest flex items-center gap-2 transition duration-300 w-fit cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-stone-400 animate-pulse" />
                      {isAiAnalyzing ? "Mengkalkulasi Formula Lab..." : "Kalkulasi Formula AI"}
                    </button>

                    {/* AI Formula Result Card */}
                    {aiNotes && (
                      <div className="border border-stone-200 bg-[#FAFAFA] p-5 rounded-2xl relative overflow-hidden animate-fadeIn">
                        <div className="absolute right-4 top-4 opacity-5 pointer-events-none">
                          <Flower className="w-24 h-24 text-stone-800" />
                        </div>
                        <h4 className="text-[10px] font-bold text-stone-800 uppercase tracking-widest flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-stone-600" /> Recommended Pyramid Notes (Saran Lab AI)
                        </h4>
                        
                        <div className="grid grid-cols-3 gap-3 mt-4 text-center">
                          <div className="bg-white p-2.5 rounded-xl border border-stone-200 shadow-xs">
                            <span className="text-[9px] text-stone-400 font-bold uppercase block">Top Note</span>
                            <span className="text-xs font-semibold text-stone-700 block mt-1">{aiNotes.top}</span>
                          </div>
                          <div className="bg-white p-2.5 rounded-xl border border-stone-200 shadow-xs">
                            <span className="text-[9px] text-stone-400 font-bold uppercase block">Middle Note</span>
                            <span className="text-xs font-semibold text-stone-700 block mt-1">{aiNotes.middle}</span>
                          </div>
                          <div className="bg-white p-2.5 rounded-xl border border-stone-200 shadow-xs">
                            <span className="text-[9px] text-stone-400 font-bold uppercase block">Base Note</span>
                            <span className="text-xs font-semibold text-stone-700 block mt-1">{aiNotes.base}</span>
                          </div>
                        </div>

                        {aiNotes.storyAnalysis && (
                          <div className="mt-4 pt-3 border-t border-stone-200">
                            <span className="text-[10px] font-bold text-[#44403C] block">Analisis Kisah:</span>
                            <p className="text-xs text-stone-500 mt-1 leading-relaxed italic">
                              "{aiNotes.storyAnalysis}"
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Section C: Personalization & Inscribing */}
                <div className="space-y-6 pt-4">
                  <h3 className="text-base font-serif font-bold text-stone-800 flex items-center gap-2 pb-2 border-b border-stone-100">
                    <span className="w-1.5 h-1.5 bg-[#1a1a1a] rounded-full" />
                    3. Nama Parfum Baru & Pesanan Tambahan
                  </h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Beri Nama Parfum Impian Anda</label>
                      <input 
                        type="text" 
                        maxLength={20}
                        placeholder="Contoh: 'Midnight in Jakarta'" 
                        value={perfumeName}
                        onChange={(e) => setPerfumeName(e.target.value)}
                        className="w-full bg-[#FAFAFA] border border-stone-200 rounded-xl px-4 py-3 text-xs font-semibold text-stone-850 outline-none transition uppercase tracking-wide" 
                      />
                      <span className="text-[9px] text-stone-400">Batas maksimal 20 huruf agar pas pada botol.</span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Ukir Plat Tembaga Kuningan (Khusus Premium)</label>
                      <input 
                        type="text" 
                        maxLength={25}
                        placeholder="Contoh: 'Ahmad R. - 2026'" 
                        disabled={packageName !== "premium"}
                        value={engravingText}
                        onChange={(e) => setEngravingText(e.target.value)}
                        className={`w-full border rounded-xl px-4 py-3 text-xs outline-none transition ${
                          packageName === "premium" 
                            ? "bg-[#FAFAFA] border-stone-200 text-stone-800 focus:border-stone-850" 
                            : "bg-stone-100 border-stone-200 text-stone-300 pointer-events-none"
                        }`} 
                      />
                      <span className="text-[9px] text-stone-400">Tersedia hanya untuk pemesanan paket Premium.</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Pilih Metode Transmisi Pembayaran</label>
                    <select 
                      value={custPayment} 
                      onChange={(e) => setCustPayment(e.target.value)}
                      className="w-full bg-[#FAFAFA] border border-stone-200 rounded-xl px-4 py-3 text-xs outline-none text-stone-800 focus:border-stone-900 transition"
                    >
                      <option value="Transfer Bank BCA">Transfer Bank Manual (BCA Rekening Puji Kurnia)</option>
                      <option value="Transfer Bank Mandiri / E-Wallet">E-Wallet (Dana, OVO, QRIS Mandiri)</option>
                    </select>
                  </div>
                </div>

              </div>

              {/* Shopping Cart Summary Side-column */}
              <div className="bg-[#1A1A1A] text-white rounded-[2rem] p-8 h-fit space-y-6 shadow-sm relative overflow-hidden">
                <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full blur-3xl pointer-events-none" />
                
                <h3 className="text-xl font-serif tracking-tight border-b border-stone-800 pb-4 flex items-center gap-2">
                  <Package className="text-stone-300 w-5 h-5" />
                  Rangkuman Order
                </h3>

                <div className="space-y-4 text-xs font-light">
                  <div className="flex justify-between">
                    <span className="text-stone-400">Tingkat Paket Jasa:</span>
                    <span className="font-bold text-stone-200 uppercase">{packageName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">Volume Cairan:</span>
                    <span className="font-semibold text-stone-200">{packages[packageName].volume}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">Poin Member didapat:</span>
                    <span className="text-stone-200 font-bold">+{packages[packageName].points} Pts</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">Metode Bayar:</span>
                    <span className="font-semibold text-stone-200">{custPayment.split(" ")[0]}</span>
                  </div>
                  {perfumeName && (
                    <div className="flex justify-between">
                      <span className="text-stone-400">Inskripsi Label:</span>
                      <span className="font-bold underline text-stone-200">"{perfumeName}"</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-stone-800 pt-5 space-y-2">
                  <span className="text-[10px] text-stone-500 font-bold uppercase block tracking-wider">Total Investasi Bespoke</span>
                  <p className="text-3xl font-mono text-stone-100 font-medium tracking-tight">
                    Rp {packages[packageName].price.toLocaleString("id-ID")}
                  </p>
                  <p className="text-[10px] text-stone-400 font-light italic">*Sudah termasuk analisis kecerdasan buatan pusat lab.</p>
                </div>

                <button 
                  onClick={handleCheckoutInvoice}
                  disabled={isSubmittingOrder}
                  className="w-full bg-stone-100 text-stone-900 font-bold py-4 rounded-full text-[10px] uppercase tracking-widest hover:bg-stone-200 transition duration-300 shadow-sm"
                >
                  {isSubmittingOrder ? "Mengonfirmasi Formulir..." : "Konfirmasi Pembayaran Order"}
                </button>
              </div>

            </div>

          </div>
        )}

        {/* 4. MEMBERSHIP POINTS REWARDS */}
        {activeTab === "tukar-poin" && (
          <div className="max-w-4xl mx-auto space-y-12 animate-fadeIn pb-12 text-left">
            
            <header className="text-center space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-[0.4em] text-stone-400 block">The Loyalty Collective</span>
              <h2 className="text-4xl font-serif text-stone-800 tracking-tight">Poin & Katalog <span className="italic font-light text-stone-550">Loyalty</span></h2>
              <p className="text-stone-500 text-xs italic">Kumpulkan poin di setiap transaksi jasa bespoke untuk menukar reward menarik</p>
            </header>

            {/* Email Point Lookup Search Card */}
            <div className="bg-[#FAFAFA] border border-stone-200 p-8 rounded-[2rem] shadow-sm space-y-6">
              
              <div className="max-w-md mx-auto text-center space-y-4">
                <h3 className="text-lg font-serif">Masukkan Alamat Email Membership</h3>
                <p className="text-xs text-stone-500 font-light">Poin diakumulasikan otomatis dari seluruh history pemesanan parfum Anda.</p>
                
                <div className="flex gap-2 p-1.5 bg-white border border-stone-200 rounded-full max-w-sm mx-auto">
                  <input 
                    type="email" 
                    placeholder="Contoh: ahmad@gmail.com" 
                    value={pointsEmailInput}
                    onChange={(e) => setPointsEmailInput(e.target.value)}
                    className="bg-transparent flex-1 px-4 text-xs outline-none text-stone-800"
                  />
                  <button 
                    onClick={handlePointsSearch}
                    className="bg-[#1A1A1A] text-white hover:bg-stone-850 px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 transition"
                  >
                    <Search className="w-3 h-3" />
                    Cek
                  </button>
                </div>
              </div>

              {/* Display Member Points State Card */}
              {pointsSearched && pointsMemberData && (
                <div className="border-t border-stone-200 pt-6 mt-6 animate-fadeIn">
                  <div className="grid md:grid-cols-3 gap-4 text-center">
                    <div className="bg-white p-4 rounded-2xl border border-stone-200/65">
                      <span className="text-[9px] text-[#A8A29E] font-bold uppercase tracking-wider block">Nama Pelanggan</span>
                      <span className="text-base font-serif font-bold text-[#292524] mt-1 block">{pointsMemberData.name}</span>
                    </div>
                    <div className="bg-[#1A1A1A] text-[#FAFAFA] p-4 rounded-2xl border border-transparent shadow">
                      <span className="text-[9px] text-stone-400 font-bold uppercase tracking-wider block">Akumulasi Loyalty Poin</span>
                      <span className="text-2xl font-mono font-bold mt-1 block">
                        👑 {pointsMemberData.points} Pts
                      </span>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-stone-200/65">
                      <span className="text-[9px] text-[#A8A29E] font-bold uppercase tracking-wider block">Total Pembelian Jasa</span>
                      <span className="text-base font-mono font-bold text-stone-800 mt-1 block">
                        Rp {pointsMemberData.totalSpent.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Catalog of Prizes */}
            <div className="space-y-6">
              <h3 className="text-xl font-serif text-stone-850 flex items-center gap-2">
                <Coins className="text-stone-500 w-5 h-5 animate-pulse" />
                Tukarkan Poin dengan Reward Spesial
              </h3>

              <div className="grid md:grid-cols-2 gap-4 text-left">
                {loyaltyRewards.map((reward) => {
                  const isEligible = pointsMemberData ? pointsMemberData.points >= reward.cost : false;
                  return (
                    <div 
                      key={reward.name} 
                      className={`bg-white border rounded-[2rem] p-6 flex flex-col justify-between shadow-xs transition hover:border-stone-400 ${
                        isEligible ? "border-stone-800 bg-stone-50/50" : "border-stone-200"
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <h4 className="text-base font-serif font-bold text-stone-800">{reward.name}</h4>
                          <span className="bg-stone-100 text-stone-800 text-[10px] font-bold font-mono py-1 px-3.5 rounded-full border border-stone-200">
                            {reward.cost} Pts
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 font-light leading-relaxed">{reward.desc}</p>
                      </div>

                      <button 
                        onClick={() => claimRewardCatalog(reward)}
                        className={`w-full mt-4 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition duration-300 ${
                          isEligible 
                            ? "bg-[#1A1A1A] text-white hover:bg-stone-855" 
                            : "bg-stone-50 border border-stone-200 text-stone-400 pointer-events-none cursor-not-allowed"
                        }`}
                      >
                        {pointsMemberData ? (isEligible ? "Tukarkan" : "Poin Tidak Cukup") : "Tautkan Email Di Atas"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* 5. LACAK STATUS ORDER (TRACKING PANEL) */}
        {activeTab === "lacak-status" && (
          <div className="max-w-2xl mx-auto space-y-12 animate-fadeIn pb-12 text-left">
            
            <header className="text-center space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-[0.4em] text-stone-400 block">Scent Tracking Engine</span>
              <h2 className="text-4xl font-serif text-stone-800 tracking-tight">Status Pemantauan <span className="italic font-light text-stone-550">Bespoke</span></h2>
              <p className="text-stone-500 text-xs italic">Pantau kemajuan formulasi matangnya parfum bespoke pesanan Anda</p>
            </header>

            {/* Tracking Search Input */}
            <div className="bg-[#FAFAFA] p-6 rounded-[2rem] border border-stone-200/80 shadow-sm text-left">
              <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block mb-2">Input ID Invoice / Nomor Order</span>
              <div className="flex gap-2 p-1.5 bg-white border border-stone-200 rounded-full max-w-md">
                <input 
                  type="text" 
                  placeholder="Masukkan HIM-INV-XXXXXX atau nomor digit saja" 
                  value={trackingSearchId}
                  onChange={(e) => setTrackingSearchId(e.target.value)}
                  className="bg-transparent flex-1 px-4 text-xs font-mono tracking-widest uppercase outline-none text-stone-800"
                />
                <button 
                  onClick={handleTrackingSearch}
                  className="bg-[#1A1A1A] text-white hover:bg-stone-850 px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition"
                >
                  Pantau Jasa
                </button>
              </div>
            </div>

            {/* Tracking Timeline Output */}
            {trackingResult ? (
              <div className="bg-white rounded-[2rem] border border-stone-200 p-8 space-y-8 shadow-sm relative overflow-hidden">
                
                <div className="border-b border-stone-100 pb-4 flex justify-between items-center text-left">
                  <div>
                    <span className="text-[9px] text-[#A8A29E] font-bold uppercase block">ID Invoice Pesanan</span>
                    <h3 className="text-base font-mono font-bold text-stone-800">{trackingResult.orderId}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-stone-400 font-bold uppercase block">Nama Inskripsi</span>
                    <span className="text-xs font-serif font-bold italic">"{trackingResult.perfumeName}"</span>
                  </div>
                </div>

                {/* Vertical Process Steps */}
                <div className="space-y-6 text-left">
                  {[
                    { label: "Menunggu Pembayaran", desc: "Formulir lab diterima. Menunggu verifikasi slip transfer BCA.", code: "Menunggu Pembayaran" },
                    { label: "Formulasi Lab", desc: "Aroma dianalisis AI dan diproses manual (Hand-pour) oleh Perfumer Artisan.", code: "Formulasi" },
                    { label: "Maturasi / Curing", desc: "Proses maturasi minyak esensial matang alami dalam suhu dingin terkontrol agar aroma menyatu maksimal.", code: "Curing" },
                    { label: "Siap Kirim", desc: "Cairan dimasukkan botol kaca premium, plat diukir laser, aman dibalut bubble wrap.", code: "Siap Kirim" },
                    { label: "Selesai", desc: "Parfum telah diterima, siap memancarkan persona identitas Anda yang baru.", code: "Selesai" }
                  ].map((step, idx) => {
                    const statusCycle = ["Menunggu Pembayaran", "Formulasi", "Curing", "Siap Kirim", "Selesai"];
                    const currentStatusIdx = statusCycle.indexOf(trackingResult.status);
                    const stepStatusIdx = statusCycle.indexOf(step.code);
                    const isActive = stepStatusIdx <= currentStatusIdx;

                    return (
                      <div key={idx} className="flex gap-4 items-start relative">
                        {/* Connecting Line */}
                        {idx < 4 && (
                          <div className={`absolute left-4 top-8 w-px h-12 -z-10 ${
                            stepStatusIdx < currentStatusIdx ? "bg-stone-800" : "bg-stone-100"
                          }`} />
                        )}
                        <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center font-mono font-bold text-[10px] border transition-all duration-300 ${
                          isActive 
                            ? "bg-[#1A1A1A] text-white border-stone-900" 
                            : "bg-white border-stone-200 text-stone-400"
                        }`}>
                          0{idx + 1}
                        </div>
                        <div className="space-y-1">
                          <h4 className={`text-xs font-bold uppercase tracking-wider ${isActive ? "text-stone-850" : "text-stone-400"}`}>
                            {step.label}
                          </h4>
                          <p className="text-xs text-stone-500 font-light leading-relaxed">{step.desc}</p>
                          {trackingResult.status === step.code && (
                            <span className="inline-block bg-[#1A1A1A] text-white font-mono text-[8px] py-1 px-3.5 rounded-full mt-1.5 uppercase tracking-widest animate-pulse">
                              Active Stage
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-[#FAFAFA] p-5 rounded-2xl border border-stone-200/60 mt-4 text-xs space-y-2 text-left">
                  <p className="font-semibold text-stone-800">Metode Bayar Terkonfirmasi: {trackingResult.paymentMethod}</p>
                  <p className="text-stone-550 font-light">Tujuan Pengiriman: {trackingResult.customerAddress}</p>
                </div>

              </div>
            ) : (
              <div className="text-center bg-white p-12 rounded-[2rem] border border-stone-200 shadow-sm text-stone-500 leading-relaxed space-y-4">
                <Search className="w-10 h-10 text-stone-300 mx-auto" />
                <p className="text-sm font-semibold italic text-stone-750">Tautan monitoring pesanan belum dimuat.</p>
                <p className="text-xs text-stone-400 max-w-sm mx-auto font-light">
                  Silakan masukkan nomor invoice Anda yang berisikan format prefix 'HIM-INV-xxxxxx' untuk memantau kemajuan formula di laboratorium kami.
                </p>
              </div>
            )}

          </div>
        )}

        {/* 6. KETENTUAN LAYANAN (T&C) */}
        {activeTab === "ketentuan" && (
          <div className="max-w-3xl mx-auto space-y-10 animate-fadeIn pb-12 text-left">
            
            <header className="text-center space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-[0.4em] text-stone-400 block">The Protocol</span>
              <h2 className="text-4xl font-serif text-stone-800 tracking-tight">Ketentuan Jasa Lab <span className="italic font-light text-stone-550">Bespoke</span></h2>
              <p className="text-stone-500 text-xs italic">Aturan transparansi tinggi demi kebaikan dan kenyamanan bersama</p>
            </header>

            <div className="bg-white border border-stone-200 rounded-[2rem] p-8 md:p-10 shadow-sm space-y-6 text-stone-850 text-xs leading-relaxed">
              
              <section className="space-y-2.5">
                <h4 className="text-[#1A1A1A] font-serif font-bold text-base flex items-center gap-2">
                  <Clock className="w-4 h-4 shrink-0 text-stone-500" />
                  1. Masa Maturasi yang Tidak Bisa Ditawar
                </h4>
                <p className="text-[#57534E] font-light leading-relaxed">
                  Minyak esensial perfume membutuhkan proses kimia maturasi (curing) alami selama minimal 1 hingga 2 minggu sebelum dituang ke botol akhir. Hal ini mutlak agar senyawa pelarut dan minyak wangi dapat berikatan sempurna, menghasilkan pancaran aroma bertenaga (Sillage & Projection) maksimal. Kami tidak akan mempercepat proses curing demi menjaga kualitas tertinggi.
                </p>
              </section>

              <section className="space-y-2.5 pt-6 border-t border-stone-200/80">
                <h4 className="text-[#1A1A1A] font-serif font-bold text-base flex items-center gap-2">
                  <CreditCard className="w-4 h-4 shrink-0 text-stone-500" />
                  2. Aturan Pembayaran & Pembatalan Kerja
                </h4>
                <p className="text-[#57534E] font-light leading-relaxed">
                  Mengingat jasa pembuatan bespoke merupakan kreasi produk kustomisasi mutlak yang dirancang khas hanya untuk satu kepribadian individu spesifik, pesanan tidak dapat dibatalkan, dicairkan kembali, ataupun dinegosiasikan setelah formulir masuk lab pengolahan.
                </p>
              </section>

              <section className="space-y-2.5 pt-6 border-t border-stone-200/80">
                <h4 className="text-[#1A1A1A] font-serif font-bold text-base flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-stone-500" />
                  3. Jaminan Rusak & Syarat Pengembalian (Unboxing Video)
                </h4>
                <p className="text-[#57534E] font-light leading-relaxed">
                  Kami sepenuhnya mengasuransikan keamanan botol kaca di pengiriman. Botol pecah, rembes parah, atau plat kuningan penyok saat unboxing, akan kami ganti total 100% dengan botol baru yang diformulasikan ulang bebas biaya. Syarat wajib klaim ini adalah menyediakan video unboxing detail tanpa jeda (cut) dari posisi segel kurir masih utuh.
                </p>
              </section>

              <section className="space-y-2.5 pt-6 border-t border-stone-200/80">
                <h4 className="text-[#1A1A1A] font-serif font-bold text-base flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 shrink-0 text-stone-500" />
                  4. Toleransi Subjektivitas Aroma
                </h4>
                <p className="text-[#57534E] font-light leading-relaxed">
                  Kisah visual emosional yang diterjemahkan oleh kecerdasan buatan dan artisan adalah penciptaan konseptual seni aroma. Ketidakcocokan persepsi keharuman subjektif selera pribadi Anda (misalnya merasa mawar kurang tajam atau musk dirasa terlampau lembut) bukan merupakan klaim yang dapat dijadikan syarat pengembalian dana, melainkan dapat didiskusikan di lab kami untuk koreksi penyesuaian formula lain kali.
                </p>
              </section>

            </div>

          </div>
        )}

        {/* 7. ADMIN BACK OFFICE (SECURE TAB) */}
        {activeTab === "admin" && (
          <div className="space-y-8 animate-fadeIn pb-12">
            
            {/* Owner Authenticator Screen */}
            {!isAdminAuthenticated ? (
              <div className="max-w-md mx-auto py-12 space-y-6 text-left">
                <div className="text-center space-y-2">
                  <div className="w-10 h-10 bg-stone-50 text-stone-800 rounded-full flex items-center justify-center mx-auto mb-2 border border-stone-250">
                    <Lock className="w-4 h-4" />
                  </div>
                  <h2 className="text-3xl font-serif text-stone-800 tracking-tight">Artisan Portal Login</h2>
                  <p className="text-[10px] text-stone-400 uppercase tracking-[0.25em] font-bold">Authorized laboratory personnel only</p>
                </div>

                <div className="bg-white border border-stone-200 p-8 rounded-[2rem] shadow-sm space-y-6">
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block mb-1.5">Sandi Autentikasi Lab</label>
                      <input 
                        type="password"
                        placeholder="••••••••"
                        value={adminPassword}
                        onChange={(e) => {
                          setAdminPassword(e.target.value);
                          if (e.target.value === "HoH.2026") {
                            setIsAdminAuthenticated(true);
                            triggerToast("Akses Lab Terverifikasi. Selamat Datang.", "success");
                            fetchAdminData();
                          }
                        }}
                        className="w-full bg-[#FAFAFA] border border-stone-200 rounded-xl px-4 py-4 text-center font-mono text-stone-800 focus:border-stone-900 outline-none transition tracking-widest text-lg"
                      />
                    </div>

                    <button 
                      onClick={handleAdminVerify}
                      className="w-full bg-[#1A1A1A] text-white hover:bg-stone-850 py-3.5 rounded-full font-bold text-[10px] uppercase tracking-widest transition cursor-pointer"
                    >
                      Buka Dashboard
                    </button>
                  </div>

                  <div className="pt-4 border-t border-stone-100 text-center">
                    <button 
                      onClick={handleForgotPassword}
                      className="text-[10px] text-stone-400 hover:text-stone-700 font-bold uppercase tracking-wider transition cursor-pointer"
                    >
                      Lupa password? Kirim pemulihan sandi ke email
                    </button>
                    <p className="text-[8px] text-stone-400 leading-relaxed mt-2 uppercase font-mono tracking-wider">
                      *Memicu email ke pujikurnia.work@gmail.com & himmelfragrance
                    </p>
                  </div>

                </div>
              </div>
            ) : (
              
              /* OWNER SYSTEM HUB */
              <div className="space-y-10 animate-fadeUp text-left">
                
                {/* Header Information Dashboard Panel */}
                <div className="bg-[#1A1A1A] text-white rounded-[2rem] p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/5 opacity-5 pointer-events-none" />
                  
                  <div className="space-y-1.5">
                    <span className="text-stone-400 text-[10px] uppercase font-bold tracking-[0.4em] block font-mono">Laboratorium Pemilik Toko</span>
                    <h2 className="text-3xl font-serif">Himmel Artisan Back Office</h2>
                    <p className="text-stone-400 text-xs font-light">Sistem monitoring status pesanan, membership loyalti, portfolio, dan analytics.</p>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={fetchAdminData}
                      className="bg-stone-850 text-stone-300 hover:bg-stone-800 hover:text-white px-4 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition border border-stone-800 flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Segarkan
                    </button>
                    
                    <button 
                      onClick={() => { setIsAdminAuthenticated(false); setAdminPassword(""); }}
                      className="bg-[#1A1A1A] border border-stone-800 text-stone-400 hover:text-white px-4 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Kunci Jendela
                    </button>
                  </div>
                </div>

                {/* Sub-Tabs Selector inside Back Office */}
                <div className="flex flex-wrap gap-2 border-b border-stone-200 pb-2">
                  {[
                    { id: "pekerjaan", label: "Antrean Modul Pekerjaan", icon: Clock },
                    { id: "members", label: "Database Customer Poin", icon: User },
                    { id: "rekap", label: "Rekap & Analytics Omzet", icon: TrendingUp },
                    { id: "portofolio-manager", label: "Kelola Galeri", icon: ImageIcon },
                    { id: "rewards-manager", label: "Kelola Katalog Reward", icon: Gift },
                    { id: "mail-logs", label: "Sandbox Mail Console", icon: Inbox }
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button 
                        key={tab.id}
                        onClick={() => setAdminSubTab(tab.id)}
                        className={`px-4 py-3 rounded-full text-[10px] font-bold uppercase tracking-wider transition flex items-center gap-2 cursor-pointer ${
                          adminSubTab === tab.id 
                            ? "bg-[#1A1A1A] text-white" 
                            : "text-stone-500 hover:bg-stone-100"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* SUB TAB CONTROLLER IN OFFICE PORTAL */}
                <div className="space-y-6">

                  {/* SUB TAB A: KANBAN ORDER STATUS MONITORING */}
                  {adminSubTab === "pekerjaan" && (
                    <div className="bg-white border border-stone-200 rounded-[2rem] p-6 shadow-xs space-y-6 animate-fadeIn">
                      <div className="flex justify-between items-center border-b border-stone-150 pb-4">
                        <h3 className="text-xl font-serif text-stone-800">Kemajuan Pekerjaan Bespoke</h3>
                        <span className="bg-stone-100 text-stone-800 text-[10px] font-mono font-bold py-1 px-3.5 rounded-full border border-stone-200">
                          {orders.length} Antrean Masuk
                        </span>
                      </div>

                      {orders.length === 0 ? (
                        <div className="text-center py-12 text-stone-400 space-y-3">
                          <Package className="w-12 h-12 mx-auto text-stone-300 animate-pulse" />
                          <p className="text-xs font-semibold uppercase tracking-wider">Belum ada order masuk di database.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {orders.map((o) => (
                            <div key={o.orderId} className="border border-stone-200 p-5 rounded-2xl bg-[#FAFAFA] space-y-4 hover:border-stone-400 transition duration-300">
                              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-stone-900 font-mono font-bold text-sm">{o.orderId}</span>
                                    <span className="bg-stone-200 text-stone-700 text-[8px] font-bold py-0.5 px-2 rounded-full uppercase tracking-widest font-mono">
                                      {o.category}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-stone-500 mt-0.5 font-light">
                                    Tanggal order: {o.date} | Oleh: <span className="font-bold text-stone-800">{o.customerName}</span> ({o.customerEmail})
                                  </p>
                                </div>

                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Status Tahap:</span>
                                  <select 
                                    value={o.status}
                                    onChange={(e) => handleUpdateOrderStatus(o.orderId, e.target.value)}
                                    className="bg-white border border-stone-200 text-xs rounded-lg py-1 px-2.5 font-semibold text-stone-800 outline-none focus:border-stone-900"
                                  >
                                    <option value="Menunggu Pembayaran">Menunggu Pembayaran (Verifikasi Slip)</option>
                                    <option value="Formulasi">Formulasi Lab (Perfumer Artisan)</option>
                                    <option value="Curing">Maturasi / Curing (Suhu Dingin)</option>
                                    <option value="Siap Kirim font-bold">Siap Kirim (Kemasan)</option>
                                    <option value="Selesai">Selesai (Sampai Tujuan)</option>
                                  </select>
                                </div>
                              </div>

                              <div className="grid md:grid-cols-2 gap-4 pt-3.5 border-t border-stone-200/80 text-xs">
                                <div>
                                  <span className="text-[9px] text-stone-400 font-bold uppercase tracking-wider block">Kisah & Karakter Utama:</span>
                                  <p className="text-stone-600 italic font-light leading-relaxed mt-1">
                                    "{o.story}"
                                  </p>
                                  {o.moods.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {o.moods.map(md => (
                                        <span key={md} className="bg-stone-100 text-stone-800 font-mono text-[9px] py-0.5 px-2 rounded-full border border-stone-200 uppercase tracking-wider">
                                          {md}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <div className="space-y-1.5 border-l border-stone-150 pl-4">
                                  <div className="flex justify-between">
                                    <span className="text-stone-400">Aransemen Label:</span>
                                    <span className="font-bold text-stone-800">"{o.perfumeName}"</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-stone-400">Total Nominal:</span>
                                    <span className="font-bold text-stone-800 font-mono">Rp {o.amount.toLocaleString("id-ID")}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-stone-400">Alamat Kirim:</span>
                                    <span className="font-medium text-stone-600">{o.customerAddress}</span>
                                  </div>
                                  {o.engraving && (
                                    <div className="flex justify-between text-stone-800 bg-stone-100/65 border border-stone-200 px-2 py-0.5 rounded text-[11px]">
                                      <span>Grafir Kuningan:</span>
                                      <span className="font-bold font-mono">"{o.engraving}"</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* SUB TAB B: DATABASE CUSTOMER & POINTS MANAGEMENT */}
                  {adminSubTab === "members" && (
                    <div className="grid lg:grid-cols-3 gap-8 animate-fadeIn">
                      
                      {/* Database List Table */}
                      <div className="lg:col-span-2 bg-white border border-stone-200 rounded-[2rem] p-6 shadow-xs space-y-4">
                        <div className="border-b border-stone-150 pb-3">
                          <h3 className="text-xl font-serif text-stone-800">Database Pelanggan Membership</h3>
                          <p className="text-stone-400 text-xs font-light">History pengumpulan poin dan total belanja masing-masing surel email member.</p>
                        </div>

                        {customers.length === 0 ? (
                          <div className="text-center py-10 text-stone-400 text-xs uppercase font-bold tracking-wider">
                            <p>Belum ada database customer terdaftar.</p>
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="border-b border-stone-200 text-stone-700 uppercase font-bold text-[9px] tracking-wider">
                                  <th className="py-3 px-2">Nama Member</th>
                                  <th className="py-3 px-2">Surel Email</th>
                                  <th className="py-3 px-2 text-center text-stone-800">Akumulasi Poin</th>
                                  <th className="py-3 px-2 text-right">Total Transaksi</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-stone-150">
                                {customers.map(c => (
                                  <tr key={c.email} className="hover:bg-stone-50 transition">
                                    <td className="py-3.5 px-2 font-bold text-stone-800">{c.name}</td>
                                    <td className="py-3.5 px-2 text-stone-500 font-mono font-medium">{c.email}</td>
                                    <td className="py-3.5 px-2 text-center text-[#1A1A1A] font-bold font-mono">
                                      🏆 {c.points} Pts
                                    </td>
                                    <td className="py-3.5 px-2 text-right font-semibold font-mono text-stone-700">
                                      Rp {c.totalSpent.toLocaleString("id-ID")}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>

                      {/* Manual Point Adjuster Panel */}
                      <div className="bg-white border border-stone-200 p-6 rounded-[2rem] h-fit space-y-5 shadow-xs">
                        <h4 className="text-sm font-serif font-bold border-b border-stone-150 pb-2">Manual Point Adjuster</h4>
                        <p className="text-stone-400 text-xs font-light">Penyesuaian manual poins member jika ada kesepakatan khusus.</p>

                        <div className="space-y-4">
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Email Member</label>
                            <input 
                              type="email" 
                              placeholder="Masukkan email terdaftar" 
                              value={adjustEmail}
                              onChange={(e) => setAdjustEmail(e.target.value)}
                              className="w-full bg-[#FAFAFA] border border-stone-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-stone-900"
                            />
                          </div>
                          
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Jumlah Poin (+/-)</label>
                            <input 
                              type="number" 
                              placeholder="Contoh: 10 atau -50" 
                              value={adjustValue || ""}
                              onChange={(e) => setAdjustValue(Number(e.target.value))}
                              className="w-full bg-[#FAFAFA] border border-stone-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-stone-900"
                            />
                          </div>

                          <button 
                            onClick={async () => {
                              if (!adjustEmail) {
                                triggerToast("Email member wajib diisi.", "error");
                                return;
                              }
                              try {
                                const res = await fetch(`/api/members/${encodeURIComponent(adjustEmail.toLowerCase().trim())}`);
                                if (!res.ok) throw new Error();
                                const customer = await res.json();
                                if (!customer || customer.name === "Pengunjung Baru") {
                                  triggerToast("Member belum ada di database.", "error");
                                  return;
                                  }

                                const updatedCust = customers.map(c => {
                                  if (c.email === customer.email) {
                                    return { ...c, points: Math.max(0, c.points + adjustValue) };
                                  }
                                  return c;
                                });
                                setCustomers(updatedCust);
                                triggerToast(`Sukses mengubah poin ${customer.email} sebanyak ${adjustValue} Pts!`, "success");
                                setAdjustEmail("");
                                setAdjustValue(0);
                              } catch (e) {
                                triggerToast("Email member salah atau server bermasalah.", "error");
                              }
                            }}
                            className="w-full bg-[#1A1A1A] text-white hover:bg-stone-850 text-[10px] uppercase tracking-widest font-bold py-2.5 rounded-full transition cursor-pointer"
                          >
                            Terapkan Penyesuaian
                          </button>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* SUB TAB C: BUSINESS INTELLIGENCE REKAP ANALYTICS CHARTA */}
                  {adminSubTab === "rekap" && (
                    <div className="space-y-6 animate-fadeIn">
                      
                      {/* STATS OVERVIEW VALUE CARDS */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white border border-stone-200 p-5 rounded-2xl shadow-xs text-left">
                          <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block font-mono">Total Omzet Bisnis</span>
                          <span className="text-base font-mono font-bold text-[#292524] mt-1 block">
                            Rp {totalOmzet.toLocaleString("id-ID")}
                          </span>
                        </div>
                        <div className="bg-white border border-stone-200 p-5 rounded-2xl shadow-xs text-left">
                          <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block font-mono">Total Members Aktif</span>
                          <span className="text-lg font-serif font-bold text-[#1A1A1A] mt-1 block">
                            {currentTotalMembersCount} Users
                          </span>
                        </div>
                        <div className="bg-white border border-stone-200 p-5 rounded-2xl shadow-xs text-left">
                          <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block font-mono font-bold text-stone-400">Estimasi Antrean Jasa</span>
                          <span className="text-lg font-serif font-bold text-stone-800 mt-1 block">
                            {totalBespokeInLabCount} Antrean
                          </span>
                        </div>
                        <div className="bg-white border border-stone-200 p-5 rounded-2xl shadow-xs text-left">
                          <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block font-mono">Faktur Terbit</span>
                          <span className="text-lg font-mono font-bold text-stone-700 mt-1 block">
                            {orders.length + 2} Docs
                          </span>
                        </div>
                      </div>

                      {/* DATA VISUAL STATS CHART */}
                      <div className="grid md:grid-cols-2 gap-6">
                        
                        {/* CHART 1: Area Trends monthly sales */}
                        <div className="bg-white border border-stone-200 p-5 rounded-[2rem] shadow-xs space-y-4">
                          <h4 className="text-sm font-bold font-serif border-b border-stone-150 pb-2">Analisis Omzet Penjualan Bespoke (Bulanan)</h4>
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={processSalesData()}>
                                <defs>
                                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#292524" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="#292524" stopOpacity={0}/>
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7E5E4" />
                                <XAxis dataKey="name" stroke="#888" fontSize={10} tickLine={false} />
                                <YAxis stroke="#888" fontSize={10} tickLine={false} />
                                <Tooltip formatter={(value) => [`Rp ${Number(value).toLocaleString()}`, "Omzet"]} />
                                <Area type="monotone" dataKey="BespokeSales" stroke="#1A1A1A" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSales)" />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* CHART 2: Package Categories Contrib Distribution Pie */}
                        <div className="bg-white border border-stone-200 p-5 rounded-[2rem] shadow-xs space-y-4">
                          <h4 className="text-sm font-bold font-serif border-b border-stone-150 pb-2">Distribusi Tingkat Klasifikasi Paket</h4>
                          <div className="h-64 flex flex-col justify-between">
                            <ResponsiveContainer width="100%" height="75%">
                              <PieChart>
                                <Pie
                                  data={processCategoryData()}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={50}
                                  outerRadius={75}
                                  paddingAngle={4}
                                  dataKey="value"
                                >
                                  {processCategoryData().map((entry, index) => {
                                    // Elegant monotone stone cells
                                    const colors = ["#1A1A1A", "#44403C", "#78716C", "#A8A29E"];
                                    return (
                                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                    );
                                  })}
                                </Pie>
                                <Tooltip />
                              </PieChart>
                            </ResponsiveContainer>
                            <div className="flex justify-center gap-4 text-[10px] font-semibold flex-wrap">
                              {processCategoryData().map((c, index) => {
                                const colors = ["#1A1A1A", "#44403C", "#78716C", "#A8A29E"];
                                return (
                                  <span key={c.name} className="flex items-center gap-1 text-stone-500">
                                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: colors[index % colors.length] }} />
                                    {c.name} ({c.value} Unit)
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                      </div>

                    </div>
                  )}

                  {/* SUB TAB D: PORTFOLIO GALLERY IMAGES MANAGER */}
                  {adminSubTab === "portofolio-manager" && (
                    <div className="grid lg:grid-cols-3 gap-8 animate-fadeIn">
                      
                      {/* Portofolio Form Adding Masterpiece */}
                      <form onSubmit={handleAddPortfolio} className="bg-white border border-stone-200 p-6 rounded-[2rem] h-fit space-y-5 shadow-xs text-left">
                        <h4 className="text-sm font-serif font-bold border-b border-stone-150 pb-2">Unggah Masterpiece Baru</h4>
                        
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Nama/Judul Ramuan Parfum</label>
                            <input 
                              type="text" 
                              placeholder="Misal: Sunset Amber" 
                              value={newPortTitle}
                              onChange={(e) => setNewPortTitle(e.target.value)}
                              className="w-full bg-[#FAFAFA] border border-stone-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-stone-900"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Kelas Kategori Bespoke</label>
                            <select 
                              value={newPortCategory} 
                              onChange={(e) => setNewPortCategory(e.target.value)}
                              className="w-full bg-[#FAFAFA] border border-stone-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-stone-900 text-stone-800"
                            >
                              <option value="economic">Economic Bespoke</option>
                              <option value="basic">Basic Bespoke</option>
                              <option value="standard">Standard Bespoke</option>
                              <option value="premium">Premium Bespoke</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">URL Gambar (Unsplash)</label>
                            <input 
                              type="text" 
                              placeholder="Tautan URL gambar langsung" 
                              value={newPortImage}
                              onChange={(e) => setNewPortImage(e.target.value)}
                              className="w-full bg-[#FAFAFA] border border-stone-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-stone-900"
                            />
                          </div>

                          {/* Quick Sample Image Injectors */}
                          <div className="space-y-2">
                            <span className="text-[9px] uppercase font-bold text-stone-400 tracking-wider block">Pilih Sampel Foto Cepat:</span>
                            <div className="grid grid-cols-2 gap-2">
                              {sampleUnsplashImages.map((sample, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => {
                                    setNewPortTitle(sample.title);
                                    setNewPortCategory(sample.cat);
                                    setNewPortImage(sample.url);
                                    triggerToast(`Sampel '${sample.title}' terpilih.`, "info");
                                  }}
                                  className="border border-stone-200 p-2 rounded-xl bg-stone-50 hover:bg-stone-100 text-[10px] text-left truncate font-semibold text-stone-600 block cursor-pointer"
                                >
                                  📸 {sample.title}
                                </button>
                              ))}
                            </div>
                          </div>

                          <button 
                            type="submit"
                            className="w-full bg-[#1A1A1A] text-white hover:bg-stone-850 text-[10px] uppercase tracking-widest font-bold py-2.5 rounded-full transition cursor-pointer"
                          >
                            Tambah Masterpiece
                          </button>
                        </div>
                      </form>

                      {/* Display Portfolio List Panel with Delete Option */}
                      <div className="lg:col-span-2 bg-white border border-stone-200 rounded-[2rem] p-6 shadow-xs space-y-4 text-left">
                        <div className="border-b border-stone-150 pb-3">
                          <h3 className="text-xl font-serif text-stone-850">Portofolio Masterpieces Aktif</h3>
                          <p className="text-stone-400 text-xs font-light">Klik tombol Hapus untuk menghapus instan dari katalog terbit publik.</p>
                        </div>

                        {portfolio.length === 0 ? (
                          <div className="text-center py-10 text-stone-400 text-xs font-bold uppercase tracking-wider">
                            <p>Katalog portfolio kosong.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {portfolio.map((item) => (
                              <div key={item.id} className="relative group rounded-xl border border-stone-200 overflow-hidden bg-stone-50">
                                <img src={item.image} alt={item.title} className="w-full h-24 object-cover" />
                                <div className="absolute inset-0 bg-stone-905/85 opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col justify-between p-3.5 text-white">
                                  <div className="text-left bg-black/60 p-1.5 rounded">
                                    <h5 className="font-bold text-[10px] leading-tight truncate text-stone-100">{item.title}</h5>
                                    <span className="text-[8px] uppercase font-bold text-stone-300 tracking-wider font-mono block mt-0.5">{item.category}</span>
                                  </div>
                                  <button 
                                    type="button"
                                    onClick={() => handleDeletePortfolio(item.id)}
                                    className="bg-stone-900 border border-stone-700/60 hover:bg-red-900 text-stone-300 hover:text-white p-1 rounded-lg transition duration-200 text-[9px] font-bold uppercase tracking-wider block text-center cursor-pointer"
                                  >
                                    Hapus
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>
                  )}

                  {/* SUB TAB E: SYSTEM INTEGRATED MAIL BOX INBOX SANDBOX MONITOR */}
                  {adminSubTab === "mail-logs" && (
                    <div className="bg-white border border-stone-200 rounded-[2rem] p-6 shadow-xs space-y-4 animate-fadeIn text-left">
                      <div className="border-b border-stone-150 pb-3">
                        <h3 className="text-xl font-serif text-stone-850">Lab Mail Router Delivery Logs</h3>
                        <p className="text-stone-400 text-xs font-light">
                          Halaman sandbox untuk memantau surat elektronik (E-Invoice Resmi & Password Recovery) yang dikirim sistem server ke Pujikurnia dan customer secara realtime.
                        </p>
                      </div>

                      {emailLogs.length === 0 ? (
                        <div className="text-center py-12 text-stone-300 space-y-3">
                          <Inbox className="w-12 h-12 mx-auto text-stone-200" />
                          <p className="text-xs uppercase font-bold tracking-wider">Belum ada email keluar yang terekam.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {emailLogs.map((log) => (
                            <div key={log.id} className="border border-stone-200 rounded-2xl p-4 bg-stone-50/50 space-y-2">
                              <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-stone-200 text-xs">
                                <div>
                                  <span className="font-bold text-stone-700 block">Diterima Surel: {log.to}</span>
                                  <span className="font-bold text-stone-900 block mt-1">Perihal Judul: {log.subject}</span>
                                </div>
                                <div className="text-right text-[10px] text-stone-400 font-mono">
                                  {new Date(log.timestamp).toLocaleTimeString()}
                                </div>
                              </div>
                              <pre className="p-4 bg-stone-900 text-stone-100 rounded-xl text-[10px] overflow-x-auto leading-relaxed font-mono whitespace-pre-wrap">
                                {log.body}
                              </pre>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* SUB TAB F: LOYALTY REWARDS CATALOG SYSTEM MANAGER */}
                  {adminSubTab === "rewards-manager" && (
                    <div className="grid lg:grid-cols-3 gap-8 animate-fadeIn">
                      
                      {/* Form Adding/Editing Reward item */}
                      <form onSubmit={handleSaveReward} className="bg-white border border-stone-200 p-6 rounded-[2rem] h-fit space-y-5 shadow-xs text-left">
                        <div className="border-b border-stone-150 pb-2 flex justify-between items-center">
                          <h4 className="text-sm font-serif font-bold">
                            {editingRewardId ? "Edit Item Reward" : "Tambah Item Reward Baru"}
                          </h4>
                          {editingRewardId && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingRewardId(null);
                                setRewardFormName("");
                                setRewardFormCost(50);
                                setRewardFormDesc("");
                              }}
                              className="text-[9px] uppercase tracking-wider text-red-500 font-bold hover:underline cursor-pointer"
                            >
                              Batal Edit
                            </button>
                          )}
                        </div>
                        
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-stone-400 tracking-wider font-mono">Nama / Judul Reward</label>
                            <input 
                              type="text" 
                              required
                              placeholder="Contoh: Voucher Diskon Rp 50.000"
                              value={rewardFormName}
                              onChange={(e) => setRewardFormName(e.target.value)}
                              className="w-full text-xs p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none text-[#292524] transition focus:border-stone-400"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-stone-400 tracking-wider font-mono">Biaya Poin (Pts Cost)</label>
                            <input 
                              type="number" 
                              required
                              min="1"
                              placeholder="Contoh: 100"
                              value={rewardFormCost}
                              onChange={(e) => setRewardFormCost(Number(e.target.value))}
                              className="w-full text-xs p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none text-[#292524] transition focus:border-stone-400 font-mono font-bold"
                            />
                            <p className="text-[9px] text-stone-400 font-light">
                              Poin didapat: Economic (+10), Basic (+20), Standard (+60), Premium (+150).
                            </p>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-stone-400 tracking-wider font-mono">Deskripsi Singkat Benefit</label>
                            <textarea 
                              required
                              rows={3}
                              placeholder="Jelaskan detail apa yang akan didapatkan oleh customer..."
                              value={rewardFormDesc}
                              onChange={(e) => setRewardFormDesc(e.target.value)}
                              className="w-full text-xs p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none text-[#292524] transition focus:border-stone-400 resize-none"
                            />
                          </div>

                          <button 
                            type="submit"
                            className="w-full py-3 bg-[#1A1A1A] hover:bg-stone-850 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition cursor-pointer"
                          >
                            {editingRewardId ? "Simpan Perubahan Reward" : "Terbitkan Reward Ke Katalog"}
                          </button>
                        </div>
                      </form>

                      {/* Display Active Rewards List Table */}
                      <div className="lg:col-span-2 bg-white border border-stone-200 rounded-[2rem] p-6 shadow-xs space-y-4 text-left font-sans">
                        <div className="border-b border-stone-150 pb-3">
                          <h3 className="text-xl font-serif text-stone-800">Katalog Reward Loyalty Terbit</h3>
                          <p className="text-stone-400 text-xs font-light">
                            Daftar benefit atau voucher hadiah loyalty program yang aktif dan dapat dipilih oleh pelanggan Anda.
                          </p>
                        </div>

                        {loyaltyRewards.length === 0 ? (
                          <div className="text-center py-12 text-stone-400 text-xs font-bold uppercase tracking-wider">
                            <p>Katalog reward kosong.</p>
                          </div>
                        ) : (
                          <div className="grid sm:grid-cols-2 gap-4">
                            {loyaltyRewards.map((reward) => (
                              <div key={reward.id} className="border border-stone-200 p-5 rounded-[1.5rem] bg-stone-50/40 hover:border-stone-300 transition flex flex-col justify-between">
                                <div className="space-y-2">
                                  <div className="flex justify-between items-start gap-2">
                                    <h4 className="text-sm font-serif font-bold text-stone-800 leading-tight">
                                      {reward.name}
                                    </h4>
                                    <span className="bg-[#1A1A1A] text-white shrink-0 text-[9px] font-mono font-bold py-1 px-2.5 rounded-full border border-stone-200">
                                      {reward.cost} Pts
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-[#57534E] font-light leading-relaxed">
                                    {reward.desc}
                                  </p>
                                </div>

                                <div className="flex gap-2 mt-4 border-t border-stone-150 pt-3">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingRewardId(reward.id);
                                      setRewardFormName(reward.name);
                                      setRewardFormCost(reward.cost);
                                      setRewardFormDesc(reward.desc);
                                    }}
                                    className="flex-1 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[9px] font-bold uppercase tracking-wider text-center cursor-pointer font-medium"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteReward(reward.id)}
                                    className="px-3 py-1.5 rounded-lg bg-white border border-stone-200 text-red-500 hover:bg-red-50 hover:text-red-700 text-[9px] font-bold uppercase tracking-wider text-center cursor-pointer font-medium"
                                  >
                                    Hapus
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>
                  )}

                </div>

              </div>
            )}
          </div>
        )}

      </main>

      {/* COUTURE INVOICE DETAIL VIEW MODAL */}
      <AnimatePresence>
        {currentInvoice && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white text-stone-850 w-full max-w-lg rounded-[2rem] overflow-hidden shadow-xl relative border border-stone-200"
            >
              <div className="bg-[#1A1A1A] p-8 text-white flex justify-between items-center text-left">
                <div>
                  <h2 className="text-2xl font-serif tracking-tight">INVOICE</h2>
                  <span className="text-[10px] text-stone-400 font-mono font-bold uppercase tracking-widest block mt-1">
                    {currentInvoice.orderId}
                  </span>
                </div>
                <div className="text-right">
                  <h3 className="font-bold font-serif tracking-widest text-[#FBFBF9]/90 text-sm">HIMMEL LAB</h3>
                  <p className="text-[9px] text-stone-400 mt-1 uppercase font-mono tracking-wider">{currentInvoice.date}</p>
                </div>
              </div>

              <div className="p-8 space-y-6 text-left">
                
                <div className="grid grid-cols-2 gap-4 text-xs font-light">
                  <div>
                    <p className="text-stone-400 text-[10px] uppercase font-bold tracking-wider">Ditujukan Untuk:</p>
                    <p className="font-bold text-stone-950 text-sm mt-1">{currentInvoice.customerName}</p>
                    <p className="text-stone-500 mt-0.5">{currentInvoice.customerEmail}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-stone-400 text-[10px] uppercase font-bold tracking-wider">Metode Bayar:</p>
                    <p className="font-bold text-stone-700 text-sm mt-1">{currentInvoice.paymentMethod}</p>
                  </div>
                </div>

                <div className="border-y border-stone-150 py-4 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-stone-700">
                      Bespoke Perfume: <span className="font-bold font-serif text-stone-900">"{currentInvoice.perfumeName}"</span>
                    </span>
                    <span className="font-bold font-mono text-stone-800">Rp {currentInvoice.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-stone-400">Volume: {packages[currentInvoice.category].volume}</span>
                    <span className="bg-stone-50 border border-stone-200 text-stone-700 font-bold px-2 py-0.5 rounded uppercase font-mono text-[9px]">
                      {currentInvoice.category} Bespoke
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[10px] text-stone-405 font-bold uppercase tracking-wider">Loyalty Points Earned</p>
                    <p className="text-lg font-bold text-[#1A1A1A] font-mono">
                      +{packages[currentInvoice.category].points} Pts
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-stone-400 font-bold uppercase">Total Tagihan:</p>
                    <p className="text-2xl font-mono font-bold text-stone-900 mt-0.5">
                      Rp {currentInvoice.amount.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="bg-[#FAF9F5] border border-stone-200 p-5 rounded-2xl space-y-2 text-xs">
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Instruksi Rekening BCA:</p>
                  <p className="font-bold text-stone-900 text-sm font-mono flex items-center justify-between">
                    <span>BCA: 866-023-2321</span>
                    <span className="text-xs text-stone-800 underline font-semibold cursor-pointer uppercase font-sans decoration-dotted hover:text-black" onClick={() => {
                      navigator.clipboard.writeText("8660232321");
                      triggerToast("Nomor BCA berhasil disalin ke papan klip!", "success");
                    }}>Salin BCA</span>
                  </p>
                  <p className="text-[11px] text-[#57534E] leading-relaxed italic">
                    A/N: Puji Kurnia Andrean. Faktur bukti pemesanan detail serta formulasi aroma telah sukses dikirim ke surel email Anda!
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => {
                      setCurrentInvoice(null);
                      setActiveTab("beranda");
                    }} 
                    className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold py-3.5 rounded-full text-[10px] uppercase tracking-wider transition cursor-pointer"
                  >
                    Tutup Faktur
                  </button>
                  <a 
                    href={`https://wa.me/628886103189?text=Hai%20Himmel%20Lab%20saya%20sudah%20melakukan%20order%20Bespoke%20dengan%20ID%20${currentInvoice.orderId}%20a.n%20${currentInvoice.customerName}.%20Berikut%20bukti%20slip%20transfernya.`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex-2 bg-[#1A1A1A] text-white text-center font-bold py-3.5 rounded-full text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-stone-850 transition"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    Kirim Slip ke WhatsApp
                  </a>
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* REWARD CODE REDEEM CODE SUCCESS VIEW MODAL */}
      <AnimatePresence>
        {rewardClaimed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white w-full max-w-sm rounded-[2rem] p-8 text-center space-y-6 shadow-xl border border-stone-250 text-left"
            >
              <div className="text-center space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-[0.4em] text-stone-400 block">Reward Redeemed</span>
                <h2 className="text-2xl font-serif text-stone-800 tracking-tight text-center">Penukaran Poin Sukses</h2>
              </div>
              
              <div className="space-y-1.5 text-center">
                <p className="text-xs text-stone-450 italic font-light">Berikut adalah token penukaran unik Anda untuk reward:</p>
                <p className="text-stone-850 font-serif font-semibold text-xs bg-stone-50 border border-stone-200 py-2.5 rounded-xl block tracking-wide">{rewardClaimed.rewardName}</p>
              </div>

              <div className="bg-[#FAFAFA] text-[#1A1A1A] p-5 rounded-2xl text-lg font-mono tracking-widest font-bold border border-stone-200 text-center">
                {rewardClaimed.token}
              </div>

              <div className="space-y-3 pt-2">
                <a 
                  href={`https://wa.me/628886103189?text=Halo%20Himmel%20Lab%20saya%20ingin%20mengklaim%20Poin%20Reward%20saya.%20Reward%3A%20${encodeURIComponent(rewardClaimed.rewardName)}.%20Kode%20Klaim%3A%20${rewardClaimed.token}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="block w-full bg-[#1A1A1A] text-white hover:bg-stone-850 font-bold py-3.5 rounded-full text-[10px] uppercase tracking-widest text-center"
                >
                  Klaim Hadiah via WhatsApp
                </a>
                <button 
                  onClick={() => setRewardClaimed(null)} 
                  className="text-[10px] text-stone-400 hover:text-stone-700 font-bold uppercase tracking-wider block mx-auto cursor-pointer"
                >
                  Kembali ke Penukaran
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* COUTURE BOUTIQUE FOOTER */}
      <footer className="border-t border-stone-200 bg-[#FAFAFA] py-12 relative z-10 transition-all text-left">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <h5 className="font-serif text-stone-800 text-lg">Himmel Lab</h5>
            <p className="text-xs text-[#57534E] leading-relaxed font-light">
              Mengekstrak memori, impian, dan cinta murni bernaung dalam formulasi seni minyak wewangian kustom terbaik Indonesia kelas dunia.
            </p>
          </div>
          <div className="space-y-3 text-xs">
            <span className="font-bold text-[#1A1A1A] font-serif uppercase tracking-widest block text-[10px]">Metode Pembayaran</span>
            <p className="text-[#57534E] font-light flex items-center gap-1.5 font-mono">
              <CreditCard className="w-3.5 h-3.5 shrink-0" />
              BCA Manual: 8660232321 (Puji Kurnia Andrean)
            </p>
          </div>
          <div className="space-y-3 text-xs">
            <span className="font-bold text-[#1A1A1A] font-serif uppercase tracking-widest block text-[10px]">Lab Kontak & WA ID</span>
            <p className="text-[#57534E] font-light">
              WhatsApp Layanan: <span className="font-bold text-[#1A1A1A] font-mono">0888-610-3189</span>
            </p>
          </div>
        </div>
        <div className="text-center pt-8 mt-10 border-t border-stone-200/50">
          <p className="text-[9px] uppercase tracking-[0.4em] text-stone-400">
            © 2026 HIMMEL LAB EXTENDED • Haute Custom Perfumery House • Autopilot AI Distilled
          </p>
        </div>
      </footer>

    </div>
  );
}
