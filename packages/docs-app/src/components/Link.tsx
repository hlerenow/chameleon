import React from 'react';

export const Link = (props: { children: any; url: string }) => {
  const baseUrl = import.meta.env.BASE_URL;
  return <a href={`${baseUrl}/${props.url}`}>{props.children}</a>;
};
