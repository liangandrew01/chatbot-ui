import { supabase } from "@/lib/supabase/browser-client"
import { toast } from "sonner"

// uploads the raw file (the bytes) to Supabase Storage
export const uploadFile = async (
  file: File, // JS/TS File object type is like a manilla folder with contents (file) and label description (payload): name, user_id, file_id
  payload: {
    // payload is the label description
    name: string
    user_id: string
    file_id: string
  }
) => {
  const SIZE_LIMIT = parseInt(
    // check size limit, parseInt turns string to integer
    process.env.NEXT_PUBLIC_USER_FILE_SIZE_LIMIT || "10000000" // either the size limit defined in env or 10MB
  )

  if (file.size > SIZE_LIMIT) {
    throw new Error(
      `File must be less than ${Math.floor(SIZE_LIMIT / 1000000)}MB`
    )
  }

  // create storage path
  const filePath = `${payload.user_id}/${Buffer.from(payload.file_id).toString("base64")}`

  const { error } = await supabase.storage
    .from("files")
    .upload(filePath, file, {
      upsert: true
    })

  if (error) {
    throw new Error("Error uploading file")
  }

  return filePath
}

export const deleteFileFromStorage = async (filePath: string) => {
  const { error } = await supabase.storage.from("files").remove([filePath])

  if (error) {
    toast.error("Failed to remove file!")
    return
  }
}

export const getFileFromStorage = async (filePath: string) => {
  const { data, error } = await supabase.storage
    .from("files")
    .createSignedUrl(filePath, 60 * 60 * 24) // 24hrs

  if (error) {
    console.error(`Error uploading file with path: ${filePath}`, error)
    throw new Error("Error downloading file")
  }

  return data.signedUrl
}
