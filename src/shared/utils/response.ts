export type Status = 'success' | 'faild';
export type ResponseRequest<T> = {
  status: Status;
  message: string;
  data: T | null;
  timestamp: string;
  error?: string;
};

export const responseRequest = <T>(
  status: Status,
  message: string,
  data?: T,
  error?: string,
): ResponseRequest<T> => {
  if (!status || (status !== 'success' && status !== 'faild')) {
    throw new Error("Invalid status: must be 'success' or 'faild'");
  }

  if (!message) {
    throw new Error('Message is required');
  }

  return {
    status,
    message,
    data: data || null,
    timestamp: new Date().toISOString(),
    ...(error && { error }),
  };
};
