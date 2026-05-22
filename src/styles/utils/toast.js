import {ToastAndroid} from 'react-native';

const showToast = data => {
  let message = '';

  if (typeof data === 'string') {
    message = data;
  } else if (typeof data === 'object') {
    message = data?.message || '';
  }

  ToastAndroid.show(message, ToastAndroid.SHORT);
};

const showToastWithGravity = data => {
  let message = typeof data === 'string' ? data : data?.message;

  ToastAndroid.showWithGravity(
    message,
    ToastAndroid.SHORT,
    ToastAndroid.CENTER,
  );
};

const showToastWithGravityAndOffset = data => {
  let message = typeof data === 'string' ? data : data?.message;

  ToastAndroid.showWithGravityAndOffset(
    message,
    ToastAndroid.LONG,
    ToastAndroid.BOTTOM,
    25,
    50,
  );
};

export {showToast, showToastWithGravity, showToastWithGravityAndOffset};