import GoogleIcon from '@/assets/svgs/google-icon';
import React from 'react';

const GoogleButton = () => {
  return (
    <div className="bg-blue-400/15 p-2 flex gap-2 items-center cursor-pointer rounded-md hover:bg-blue-400/60">
      <GoogleIcon width={20} height={20} />
      <span className="text-sm font-normal">sigin in with Google</span>
    </div>
  );
};

export default GoogleButton;
