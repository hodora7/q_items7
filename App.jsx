import React, { useState, useEffect } from 'react';
import { LogIn, Plus, Trash2, Save, Edit3, EyeOff, Eye, AlertCircle, UserPlus, Settings, Users, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Manual Shamsi (Jalali) Date Converter — no external lib
const toJalali = (gDate = new Date()) => {
  const d = new Date(gDate);
  const gYear = d.getFullYear();
  const gMonth = d.getMonth();
  const gDay = d.getDate();

  let jYear = gYear - 621;
  let jMonth, jDay;

  let gregorianDays = (
    365 * gYear +
    Math.floor((gYear + 3) / 4) -
    Math.floor((gYear + 99) / 100) +
    Math.floor((gYear + 399) / 400) -
    Math.floor((gYear + 3) / 400)
  );
  const jalaliEpoch = 2121446; // March 21, 622 CE
  let dayOfYear = Math.floor((d - new Date(gYear, 0, 1)) / 86400000) + 1;
  let daysSinceEpoch = gregorianDays + dayOfYear - jalaliEpoch;

  jYear = Math.floor(daysSinceEpoch / 365.2422) + 1;
  let leap = ((jYear - 1) % 33) % 4 === 0 ? 1 : 0;
  let jDays = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, leap ? 30 : 29];
  let yearStart = Math.floor((jYear - 1) * 365.2422 + jalaliEpoch);
  let dayOfYearJ = daysSinceEpoch - Math.floor((jYear - 1) * 365.2422);

  jMonth = 1;
  while (dayOfYearJ > jDays[jMonth - 1]) {
    dayOfYearJ -= jDays[jMonth - 1];
    jMonth++;
  }
  jDay = dayOfYearJ;

  const weekdays = ['یک‌شنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه'];
  const gWeekday = d.getDay();
  const jWeekday = weekdays[gWeekday === 6 ? 0 : gWeekday + 1];

  return {
    year: jYear,
    month: jMonth,
    day: jDay,
    weekday: jWeekday,
    formatted: `${jWeekday} ${jDay} ${getPersianMonthName(jMonth)} ${jYear}`
  };
};

const getPersianMonthName = (month) => {
  const months = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
  ];
  return months[month - 1];
};

// Expanded emoji icons for items (24 options)
const EMOJI_OPTIONS = [
  '🍟', '🍗', '🥖', '🧂', '🧄', '🌶️', '🥫', '🥛', '🍅', '🥬', '🥚', '🧀',
  '🥑', '🌽', '🥕', '🥒', '🥦', '🍄', '🧅', '🥙', '🍔', '🍕', '🌭', '🥪'
];

// Custom Q Logo as SVG component
const QLogo = () => (
  <svg width="80" height="80" viewBox="0 0 100 100" className="mx-auto">
    <path 
      d="M50,10 C70,10 90,30 90,50 C90,70 70,90 50,90 C30,90 10,70 10,50 C10,30 30,10 50,10 Z" 
      fill="#FF0000" 
    />
    <path 
      d="M50,10 C70,10 90,30 90,50 C90,70 70,90 50,90 C30,90 10,70 10,50 C10,30 30,10 50,10 Z" 
      fill="none" 
      stroke="#FFFFFF" 
      strokeWidth="2"
    />
    <circle cx="50" cy="50" r="30" fill="#000000" />
    <rect x="20" y="50" width="60" height="20" fill="#333333" />
    <path 
      d="M65,75 C60,70 55,65 50,60 C45,65 40,70 35,75" 
      fill="none" 
      stroke="#FFFFFF" 
      strokeWidth="3" 
      strokeLinecap="round"
    />
    <path 
      d="M65,75 C60,70 55,65 50,60 C45,65 40,70 35,75" 
      fill="none" 
      stroke="#FFFFFF" 
      strokeWidth="3" 
      strokeLinecap="round"
    />
  </svg>
);

const App = () => {
  // Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Mock users - harmad is admin (id=1)
  const [users, setUsers] = useState([
    { id: 1, username: 'harmad', password: '40222050', name: 'مدیر', role: 'admin' }
  ]);

  // Inventory state
  const [items, setItems] = useState([
    { id: 1, name: 'روغن', quantity: 4, lowThreshold: 5, emoji: '🥫' },
    { id: 2, name: 'سیب‌زمینی', quantity: 8, lowThreshold: 10, emoji: '🥔' },
    { id: 3, name: 'نان', quantity: 25, lowThreshold: 15, emoji: '🥖' },
    { id: 4, name: 'مرغ', quantity: 2, lowThreshold: 7, emoji: '🍗' },
    { id: 5, name: 'سس سیر', quantity: 3, lowThreshold: 4, emoji: '🧄' },
    { id: 6, name: 'سس تند', quantity: 9, lowThreshold: 5, emoji: '🌶️' },
    { id: 7, name: 'پودر ادویه', quantity: 1, lowThreshold: 3, emoji: '🧂' }
  ]);

  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState(0);
  const [newItem, setNewItem] = useState({ name: '', lowThreshold: 5, emoji: '🍟' });
  const [isAdding, setIsAdding] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', password: '', name: '', role: 'user' });
  const [changingPassword, setChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Get critical items (quantity <= lowThreshold)
  const criticalItems = items.filter(item => item.quantity <= item.lowThreshold);

  // Login handler
  const handleLogin = (e) => {
    e.preventDefault();
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      setIsLoggedIn(true);
      setCurrentUser(user);
    } else {
      alert('نام کاربری یا رمز عبور اشتباه است!');
    }
  };

  // Logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
    setCurrentUser(null);
  };

  // Edit quantity
  const startEdit = (id, currentQty) => {
    setEditingId(id);
    setEditValue(currentQty);
  };

  const saveEdit = () => {
    if (editValue < 0) return;
    setItems(items.map(item => 
      item.id === editingId ? { ...item, quantity: editValue } : item
    ));
    setEditingId(null);
  };

  // Delete item
  const deleteItem = (id) => {
    if (window.confirm('آیا از حذف این مورد اطمینان دارید؟')) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  // Add new item
  const handleAddItem = () => {
    if (!newItem.name.trim()) return;
    const newItemObj = {
      id: Date.now(),
      name: newItem.name.trim(),
      quantity: 0,
      lowThreshold: parseInt(newItem.lowThreshold) || 1,
      emoji: newItem.emoji
    };
    setItems([...items, newItemObj]);
    setNewItem({ name: '', lowThreshold: 5, emoji: '🍟' });
    setIsAdding(false);
  };

  // Update quantity via buttons
  const updateQuantity = (id, delta) => {
    setItems(items.map(item => 
      item.id === id 
        ? { ...item, quantity: Math.max(0, item.quantity + delta) } 
        : item
    ));
  };

  // Add new user (admin only)
  const handleAddUser = () => {
    if (!newUser.username.trim() || !newUser.password.trim() || !newUser.name.trim()) {
      alert('لطفاً همه فیلدها را پر کنید');
      return;
    }
    
    if (users.some(u => u.username === newUser.username)) {
      alert('این نام کاربری قبلاً استفاده شده است');
      return;
    }
    
    const newUserObj = {
      id: Date.now(),
      username: newUser.username.trim(),
      password: newUser.password,
      name: newUser.name.trim(),
      role: newUser.role
    };
    
    setUsers([...users, newUserObj]);
    setNewUser({ username: '', password: '', name: '', role: 'user' });
    alert('کاربر جدید با موفقیت اضافه شد');
  };

  // Change password (for current user)
  const handleChangePassword = () => {
    if (!newPassword || !confirmPassword) {
      alert('لطفاً همه فیلدها را پر کنید');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      alert('رمزهای عبور مطابقت ندارند');
      return;
    }
    
    if (newPassword.length < 4) {
      alert('رمز عبور باید حداقل 4 کاراکتر باشد');
      return;
    }
    
    setUsers(users.map(u => 
      u.id === currentUser.id ? { ...u, password: newPassword } : u
    ));
    
    alert('رمز عبور با موفقیت تغییر کرد');
    setChangingPassword(false);
    setNewPassword('');
    setConfirmPassword('');
  };

  // Get current Jalali date
  const [jalaliDate, setJalaliDate] = useState(toJalali());

  useEffect(() => {
    const timer = setInterval(() => {
      setJalaliDate(toJalali());
    }, 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-center">
            <div className="mb-4">
              <QLogo />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Q</h1>
            <p className="text-amber-100 mt-2">سامانه مدیریت موجودی فست‌فود</p>
          </div>
          
          <form onSubmit={handleLogin} className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">نام کاربری</label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="نام کاربری خود را وارد کنید"
                  dir="rtl"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">رمز عبور</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="رمز عبور خود را وارد کنید"
                  dir="rtl"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-3 text-gray-500"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
            >
              <LogIn size={20} />
              ورود به سیستم
            </motion.button>
          </form>
          
          {/* Removed username/password display */}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Critical Items Alert Banner */}
      {criticalItems.length > 0 && (
        <motion.div 
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="bg-red-50 border-b border-red-200 p-3"
        >
          <div className="max-w-4xl mx-auto flex items-center gap-3">
            <AlertCircle className="text-red-500 flex-shrink-0" size={24} />
            <div>
              <p className="font-bold text-red-700">محصولات با موجودی بحرانی:</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {criticalItems.map(item => (
                  <span 
                    key={item.id} 
                    className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm flex items-center gap-1"
                  >
                    {item.emoji} {item.name} ({item.quantity})
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10">
              <QLogo />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Q</h1>
              <p className="text-sm text-gray-500 mt-1">
                {jalaliDate.formatted}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => setShowUserManagement(true)}
                className="p-2 text-amber-600 hover:text-amber-800 bg-amber-50 rounded-lg"
                title="مدیریت کاربران"
              >
                <Users size={20} />
              </button>
            )}
            <button
              onClick={() => setChangingPassword(true)}
              className="p-2 text-gray-600 hover:text-gray-800 bg-gray-100 rounded-lg"
              title="تغییر رمز عبور"
            >
              <Settings size={20} />
            </button>
            <button
              onClick={handleLogout}
              className="text-sm text-amber-600 hover:text-amber-800 font-medium"
            >
              خروج
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Add Item Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all mb-6 w-full"
        >
          <Plus size={20} />
          افزودن محصول جدید
        </motion.button>

        {/* Items List */}
        <div className="space-y-4">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`bg-white rounded-2xl p-4 shadow-sm border ${
                  item.quantity <= item.lowThreshold 
                    ? 'border-red-200 bg-red-50' 
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{item.emoji}</div>
                    <div>
                      <h3 className="font-bold text-gray-800">{item.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        حد هشدار: {item.lowThreshold} عدد
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {editingId === item.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(parseInt(e.target.value) || 0)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                          min="0"
                        />
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={saveEdit}
                          className="text-green-600 hover:text-green-800"
                        >
                          <Save size={18} />
                        </motion.button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200"
                        >
                          -
                        </button>
                        <div 
                          onClick={() => startEdit(item.id, item.quantity)}
                          className={`px-3 py-1 rounded-lg font-bold min-w-[40px] text-center cursor-pointer transition-all ${
                            item.quantity <= item.lowThreshold
                              ? 'bg-red-200 text-red-800 animate-pulse'
                              : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          }`}
                        >
                          {item.quantity}
                        </div>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200"
                        >
                          +
                        </button>
                      </div>
                    )}
                    
                    <div className="flex gap-1">
                      {editingId !== item.id && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => startEdit(item.id, item.quantity)}
                          className="text-amber-600 hover:text-amber-800"
                        >
                          <Edit3 size={18} />
                        </motion.button>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => deleteItem(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {items.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-5xl mb-4">📦</div>
            <p>موردی یافت نشد. از دکمه بالا محصول جدید اضافه کنید.</p>
          </div>
        )}
      </main>

      {/* Add Item Modal */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center p-4 z-50"
            onClick={() => setIsAdding(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white rounded-t-2xl w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5">
                <h2 className="text-xl font-bold text-gray-800 mb-4">افزودن محصول جدید</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">نام محصول</label>
                    <input
                      type="text"
                      value={newItem.name}
                      onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="مثال: سس قارچ"
                      dir="rtl"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      حد کم بودن (تعداد)
                    </label>
                    <input
                      type="number"
                      value={newItem.lowThreshold}
                      onChange={(e) => setNewItem({...newItem, lowThreshold: e.target.value})}
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">آیکون محصول</label>
                    <div className="grid grid-cols-6 gap-2">
                      {EMOJI_OPTIONS.map(emoji => (
                        <button
                          key={emoji}
                          onClick={() => setNewItem({...newItem, emoji})}
                          className={`text-2xl p-2 rounded-lg transition-all ${
                            newItem.emoji === emoji 
                              ? 'bg-amber-100 ring-2 ring-amber-500' 
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setIsAdding(false)}
                      className="flex-1 py-2 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
                    >
                      لغو
                    </button>
                    <button
                      onClick={handleAddItem}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2 px-4 rounded-lg font-medium shadow hover:shadow-md"
                    >
                      افزودن
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Management Modal (Admin only) */}
      <AnimatePresence>
        {showUserManagement && currentUser?.role === 'admin' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowUserManagement(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">مدیریت کاربران</h2>
                  <button 
                    onClick={() => setShowUserManagement(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="mb-5">
                  <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Users size={18} />
                    لیست کاربران ({users.length})
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {users.map(user => (
                      <div 
                        key={user.id} 
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-gray-600">{user.username}</div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.role === 'admin' 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role === 'admin' ? 'مدیر' : 'کاربر'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <UserPlus size={18} />
                    افزودن کاربر جدید
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">نام کاربری</label>
                      <input
                        type="text"
                        value={newUser.username}
                        onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="نام کاربری"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">رمز عبور</label>
                      <input
                        type="password"
                        value={newUser.password}
                        onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="رمز عبور"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">نام نمایشی</label>
                      <input
                        type="text"
                        value={newUser.name}
                        onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="نام کاربر"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">سطح دسترسی</label>
                      <select
                        value={newUser.role}
                        onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="user">کاربر عادی</option>
                        <option value="admin">مدیر</option>
                      </select>
                    </div>
                    
                    <button
                      onClick={handleAddUser}
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-2 rounded-lg font-medium mt-2"
                    >
                      افزودن کاربر
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Change Password Modal */}
      <AnimatePresence>
        {changingPassword && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setChangingPassword(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">تغییر رمز عبور</h2>
                  <button 
                    onClick={() => setChangingPassword(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">رمز عبور جدید</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="رمز عبور جدید"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute left-3 top-2.5 text-gray-500"
                      >
                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">تایید رمز عبور</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="تایید رمز عبور"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute left-3 top-2.5 text-gray-500"
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setChangingPassword(false)}
                      className="flex-1 py-2 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
                    >
                      لغو
                    </button>
                    <button
                      onClick={handleChangePassword}
                      className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white py-2 px-4 rounded-lg font-medium shadow"
                    >
                      تغییر رمز عبور
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom spacer for mobile */}
      <div className="h-24"></div>
    </div>
  );
};

export default App;
