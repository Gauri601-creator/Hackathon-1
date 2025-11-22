/* app.js - shared helpers and app logic */
(() => {
  // expose helpers to window
  const STORAGE = {
    USERS: 'ims_users',
    ITEMS: 'ims_items',
    CART: 'ims_cart',
    AUTH: 'ims_auth'
  };

  function loadJSON(key, fallback){
    try{ const v = localStorage.getItem(key); return v?JSON.parse(v):fallback; } catch(e){ return fallback; }
  }
  function saveJSON(key, value){ localStorage.setItem(key, JSON.stringify(value)); }

  // Ensure default user exists
  function ensureDefaults(){
    const users = loadJSON(STORAGE.USERS, []);
    if(!users.find(u=>u.username==='admin')){
      users.push({username:'admin', password:'admin', name:'Administrator'});
      saveJSON(STORAGE.USERS, users);
    }
    if(!localStorage.getItem(STORAGE.ITEMS)){
      const sample = [
        {id: genId(), name:'Blue T-shirt', sku:'TSH-001', qty:20, price:299},
        {id: genId(), name:'Wireless Mouse', sku:'MSE-002', qty:12, price:749},
        {id: genId(), name:'Notebook A5', sku:'NTA-010', qty:50, price:69}
      ];
      saveJSON(STORAGE.ITEMS, sample);
    }
    if(!localStorage.getItem(STORAGE.CART)) saveJSON(STORAGE.CART, []);
  }

  function genId(){ return 'id'+Math.random().toString(36).slice(2,9); }

  // Auth helpers
  function login(username, password){
    const users = loadJSON(STORAGE.USERS, []);
    const u = users.find(x => x.username===username && x.password===password);
    if(u){ localStorage.setItem(STORAGE.AUTH, JSON.stringify({username:u.username, name:u.name, ts:Date.now()})); return true; }
    return false;
  }
  function logout(){ localStorage.removeItem(STORAGE.AUTH); }
  function currentUser(){ return loadJSON(STORAGE.AUTH, null); }
  function requireAuth(redirectTo='login.html'){
    if(!currentUser()){ window.location.href = redirectTo; return false; }
    return true;
  }

  // Item functions
  function getItems(){ return loadJSON(STORAGE.ITEMS, []); }
  function saveItems(items){ saveJSON(STORAGE.ITEMS, items); }
  function addItem(data){
    const items = getItems();
    const newItem = Object.assign({id:genId()}, data);
    items.push(newItem);
    saveItems(items);
    return newItem;
  }
  function updateItem(id, patch){
    const items = getItems();
    const idx = items.findIndex(i=>i.id===id);
    if(idx===-1) return false;
    items[idx] = Object.assign({}, items[idx], patch);
    saveItems(items);
    return true;
  }
  function deleteItem(id){
    let items = getItems();
    items = items.filter(i=>i.id!==id);
    saveItems(items);
  }

  // Cart functions
  function getCart(){ return loadJSON(STORAGE.CART, []); }
  function saveCart(cart){ saveJSON(STORAGE.CART, cart); }
  function addToCart(itemId, qty=1){
    const items = getItems();
    const item = items.find(it=>it.id===itemId);
    if(!item) return {ok:false, msg:'Item not found'};
    if(item.qty < qty) return {ok:false, msg:'Insufficient stock'};
    const cart = getCart();
    const c = cart.find(x=>x.itemId===itemId);
    if(c) c.qty += qty; else cart.push({itemId, qty, name:item.name, price:item.price});
    saveCart(cart);
    return {ok:true};
  }
  function removeFromCart(itemId){
    let cart = getCart();
    cart = cart.filter(c=>c.itemId!==itemId);
    saveCart(cart);
  }
  function deliverCart(){
    // reduce stock, clear cart
    const cart = getCart();
    if(cart.length===0) return {ok:false, msg:'Cart empty'};
    const items = getItems();
    for(const c of cart){
      const it = items.find(x=>x.id===c.itemId);
      if(!it || it.qty < c.qty) return {ok:false, msg:`Not enough "${c.name}" in stock`};
    }
    for(const c of cart){
      const it = items.find(x=>x.id===c.itemId);
      it.qty -= c.qty;
    }
    saveItems(items);
    saveCart([]);
    return {ok:true};
  }

  // expose
  window.IMS = {
    ensureDefaults, login, logout, currentUser, requireAuth,
    getItems, addItem, updateItem, deleteItem,
    getCart, addToCart, removeFromCart, deliverCart
  };

  // Auto init defaults
  ensureDefaults();
})();
