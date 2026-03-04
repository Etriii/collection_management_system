import axios from 'axios';

let cancelTokenSource = axios.CancelToken.source();
export const cancelPreviousRequest = () => {
    cancelTokenSource.cancel('Request canceled');
    cancelTokenSource = axios.CancelToken.source();
};