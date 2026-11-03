import axios from 'axios';
export const api=axios.create({baseURL:import.meta.env.VITE_API_URL||'http://localhost:5000/api',timeout:15000});
api.interceptors.request.use(config=>{const token=localStorage.getItem('hotel_erp_token');if(token)config.headers.Authorization=`Bearer ${token}`;return config;});
api.interceptors.response.use(response=>response,error=>{if(error.response?.status===401){localStorage.removeItem('hotel_erp_token');localStorage.removeItem('hotel_erp_user');if(location.pathname!='/login')location.href='/login';}return Promise.reject(error);});
export function errorMessage(error:unknown){
  if(axios.isAxiosError(error)){
    if(!error.response) return error.code==='ECONNABORTED' ? 'The request took too long. Please try again.' : 'We could not reach the server. Check your connection and try again.';
    return error.response.data?.message || `Something went wrong on our side (${error.response.status}). Please try again.`;
  }
  return error instanceof Error?error.message:'Something went wrong. Please try again.';
}
