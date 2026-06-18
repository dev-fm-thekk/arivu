"use server";

import { createClient } from "@/utils/supabase/server";
import { Category, QueryFetchOptions } from "@/utils/type";
import { getCurrentUserProfile } from "../auth/server-actions";
import { revalidatePath } from "next/cache";

export const createCategory = async (category: Omit<Category, "id">) => {
  const profile = await getCurrentUserProfile();
  if (profile?.role !== "admin") return { err: "Unauthorized" };

  const supabase = await createClient();
  try {
    const { error } = await supabase.from("AptitudeCategories").insert(category);
    if (error) throw new Error(`CategoryCreateError: ${error.message}`);
    revalidatePath("/admin");
    return { status: "success", message: "Created Category" };
  } catch (err) {
    console.error(err);
    return { err };
  }
};

export const editCategory = async (id: number, category: Omit<Category, "id">) => {
  const profile = await getCurrentUserProfile();
  if (profile?.role !== "admin") return { err: "Unauthorized" };

  const supabase = await createClient();
  try {
    const { error } = await supabase
      .from("AptitudeCategories")
      .update(category)
      .eq("id", id);
    if (error) throw new Error(`CategoryEditError: ${error}`);
    revalidatePath("/admin");
    return { status: "success", message: "Updated category" };
  } catch (err) {
    console.error(err);
    return { err };
  }
};

export const deleteCategory = async (id: number) => {
  const profile = await getCurrentUserProfile();
  if (profile?.role !== "admin") return { err: "Unauthorized" };

  const supabase = await createClient();
  try {
    const { error } = await supabase.from("AptitudeCategories").delete().eq("id", id);
    if (error) throw new Error(`CategoryDeleteError: ${error}`);
    revalidatePath("/admin");
    return { status: "success", message: "Delete category" };
  } catch (err) {
    console.error(err);
    return { err };
  }
};

export const fetchCategory = async (options?: QueryFetchOptions) => {
  const supabase = await createClient();

  const internalOptions: QueryFetchOptions = {
    fetchAll: true,
    fields: [],
    limit: 0,
    start: 0,
    stop: 0,
    ...options,
  };

  try {
    const fields =
      internalOptions.fields!.length > 0
        ? internalOptions.fields!.join(",")
        : "*";

    let query = supabase.from("AptitudeCategories").select(fields);

    if (!internalOptions.fetchAll) {
      if (
        internalOptions.start !== undefined &&
        internalOptions.stop !== undefined &&
        internalOptions.stop > internalOptions.start
      ) {
        query = query.range(internalOptions.start, internalOptions.stop);
      } else if (internalOptions.limit! > 0) {
        query = query.limit(internalOptions.limit!);
      }
    }

    const { data, error } = await query;

    if (error) throw error;

    return { data: data as unknown as Category[], error: null };
  } catch (err) {
    console.error("Error fetching categories:", err);
    return { data: null, error: err };
  }
};
