/**
 * إرسال استجابة ناجحة
 */
export const sendSuccess = (
  res,
  data = {},
  message = "تمت العملية بنجاح",
  statusCode = 200,
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * إرسال استجابة خطأ
 */
export const sendError = (
  res,
  message = "حدث خطأ ما",
  statusCode = 500,
  errors = null,
) => {
  const response = { success: false, message };
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
};

/**
 * إرسال استجابة مع pagination
 */
export const sendPaginated = (res, data, total, page, limit) => {
  return res.status(200).json({
    success: true,
    data,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / limit),
    },
  });
};
