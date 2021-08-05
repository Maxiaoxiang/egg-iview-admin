import HttpRequest from '@/libs/axios'
import axios from 'axios'
import config from '@/config'
const baseUrl = process.env.NODE_ENV === 'development' ? config.baseUrl.dev : config.baseUrl.pro
export default axios
