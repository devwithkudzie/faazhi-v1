export type ApiErrorResponse = {
  error: {
    code: string;
    message: string;
  };
};

export type ApiSuccessResponse<T> = {
  data: T;
};
