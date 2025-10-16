import { supabase } from './supabase';

export async function getOrCreateCart(userId: string) {
  if (!userId) throw new Error('No user id');
  const { data: cartData, error: cartError } = await supabase.from('cart').select('id').eq('user_id', userId).maybeSingle();
  if (cartError) throw cartError;
  if (cartData) return cartData;
  const { data: newCart, error: newCartError } = await supabase.from('cart').insert({ user_id: userId }).select('id').single();
  if (newCartError) throw newCartError;
  return newCart;
}

export async function addOrUpdateCartItem(userId: string, productId: string, quantity: number) {
  const cart = await getOrCreateCart(userId);
  // check existing cart item
  const { data: existing, error: existingErr } = await supabase
    .from('cart_item')
    .select('*')
    .eq('cart_id', cart.id)
    .eq('product_id', productId)
    .maybeSingle();
  if (existingErr) throw existingErr;

  if (existing) {
    const newQty = (existing.quantity || 0) + quantity;
    const { data, error } = await supabase.from('cart_item').update({ quantity: newQty }).eq('id', existing.id).select('*').single();
    if (error) throw error;
    return data;
  }

  const { data, error } = await supabase.from('cart_item').insert({ cart_id: cart.id, product_id: productId, quantity }).select('*').single();
  if (error) throw error;
  return data;
}

export async function syncCartItems(userId: string, items: Array<{ product_id: string; quantity: number }>) {
  const cart = await getOrCreateCart(userId);
  // upsert each item sequentially to avoid race conditions
  const results = [];
  for (const it of items) {
    const { data: existing } = await supabase
      .from('cart_items')
      .select('*')
      .eq('cart_id', cart.id)
      .eq('product_id', it.product_id)
      .maybeSingle();
    if (existing) {
      const newQty = (existing.quantity || 0) + it.quantity;
      const { data, error } = await supabase.from('cart_items').update({ quantity: newQty }).eq('id', existing.id).select('*').single();
      if (error) throw error;
      results.push(data);
    } else {
      const { data, error } = await supabase.from('cart_items').insert({ cart_id: cart.id, product_id: it.product_id, quantity: it.quantity }).select('*').single();
      if (error) throw error;
      results.push(data);
    }
  }
  return results;
}
