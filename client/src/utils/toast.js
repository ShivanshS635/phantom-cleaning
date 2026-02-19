import { toast } from "react-toastify";

const defaultOptions = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  className: "rounded-xl font-medium shadow-lg border-l-4",
  bodyClassName: "text-sm",
  style: { fontFamily: 'inherit' }
};

export const showSuccess = (message) => {
  toast.success(message, {
    ...defaultOptions,
    className: `${defaultOptions.className} border-green-500 bg-white text-gray-800`
  });
};

export const showError = (message) => {
  toast.error(message, {
    ...defaultOptions,
    className: `${defaultOptions.className} border-red-500 bg-white text-gray-800`
  });
};

export const showWarning = (message) => {
  toast.warning(message, {
    ...defaultOptions,
    className: `${defaultOptions.className} border-yellow-500 bg-white text-gray-800`
  });
};

export const showInfo = (message) => {
  toast.info(message, {
    ...defaultOptions,
    className: `${defaultOptions.className} border-blue-500 bg-white text-gray-800`
  });
};
