import type { PaperCourse } from "./type";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

type ApiResponse<T> = {
  data?: T;
  error?: {
    code: string;
    message: string;
  };
};

export async function fetchPaperCourse(
  subjectId: string,
  paperId: string,
  signal?: AbortSignal,
): Promise<PaperCourse> {
  const response = await fetch(
    `${API_BASE_URL}/api/subjects/${subjectId}/learn/${paperId}`,
    {
      signal,
      cache: "no-store",
    },
  );
  const body = (await response.json()) as ApiResponse<PaperCourse>;

  if (!response.ok || !body.data) {
    throw new Error(body.error?.message ?? "Unable to load lesson content");
  }

  return body.data;
}
