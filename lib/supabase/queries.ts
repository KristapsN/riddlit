import { SupabaseClient } from '@supabase/supabase-js';
import { cache } from 'react';
import { createClient } from './client';
import { PageElementProps } from '@/app/protected/page';

  export interface ProjectsResponseProps {
    created_at: string
    id: number
    images: string[]
    name: string
    page_size: string
    project_data: any[]
    user_id: string
  }

export const getUser = cache(async (supabase: SupabaseClient) => {
  const {
    data: { user }
  } = await supabase.auth.getUser();
  return user;
});

export const getProjects = cache(async (supabase: SupabaseClient, userId: string) => {
  const { data } = await supabase
    .from('projects')
    .select('id, name')
    .eq('user_id', userId)

  return data;
});

export const getProject = cache(async (supabase: SupabaseClient, userId: string): Promise<ProjectsResponseProps[]| null> => {
  const { data, error } = await supabase
    .from('projects')
    .select()
    .eq('user_id', userId)
    // .single()

  return data;
});

export const switchProject = cache(async (supabase: SupabaseClient, userId: string, projectId: number) => {
  const { data, error } = await supabase
    .from('projects')
    .select()
    .eq('user_id', userId)
    .eq('id', projectId)

  return data;
});
// @ts-ignore
export const updateProjects = cache(async (id: number, projectData: PageElementProps[], images) => {
  const supabase = createClient();
  const { error } = await supabase
    .from('projects')
    .update({ project_data: projectData, images: images})
    .eq('id', id)
});

export const createProjects = cache(async (
  // id: number,
  name: string,
  projectData: PageElementProps[],
  images: string[],
  userId: string,
  pageSize: string
) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('projects')
    .insert({ name, project_data: projectData, images, user_id: userId, page_size: pageSize })
    .select()
    .single();

    return data;
});

export const createUserCredits = cache(async (
  // id: number,
  user_id: number,
  supabase: SupabaseClient,
) => {
  const { error } = await supabase
    .from('user_credits')
    .insert({ user_id: user_id, token_balance: 1000 })
});

export const getSubscription = cache(async (supabase: SupabaseClient) => {
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*, prices(*, products(*))')
    .in('status', ['trialing', 'active'])
    .maybeSingle();

  return subscription;
});

export const getProducts = cache(async (supabase: SupabaseClient) => {
  const { data: products } = await supabase
    .from('products')
    .select('*, prices(*)')
    .eq('active', true)
    .eq('prices.active', true)
    .order('metadata->index')
    .order('unit_amount', { referencedTable: 'prices' });

  return products;
});

export const getUserDetails = cache(async (supabase: SupabaseClient) => {
  const { data: userDetails } = await supabase
    .from('users')
    .select('*')
    .single();
  return userDetails;
});

export const getCustomerDetails = cache(async (supabase: SupabaseClient) => {
  const { data: customerDetails } = await supabase
    .from('stripe.customers')
    .select('*')
  // .eq('email', userEmail)
  // .single();
  return customerDetails;
});
