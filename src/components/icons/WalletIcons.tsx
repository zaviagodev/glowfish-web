import { SVGProps } from 'react';

export function WalletIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M18 8H19C20.1046 8 21 8.89543 21 10V18C21 19.1046 20.1046 20 19 20H5C3.89543 20 3 19.1046 3 18V6C3 4.89543 3.89543 4 5 4H17C17.5523 4 18 4.44772 18 5V8ZM5 6V18H19V10H17C16.4477 10 16 9.55228 16 9V6H5Z" fill="currentColor"/>
      <path d="M17 14C17 13.4477 17.4477 13 18 13H19V15H18C17.4477 15 17 14.5523 17 14Z" fill="currentColor"/>
    </svg>
  );
}

export function CouponIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M2 9.5V7C2 6.44772 2.44772 6 3 6H21C21.5523 6 22 6.44772 22 7V9.5C20.067 9.5 19 10.567 19 12.5C19 14.433 20.067 15.5 22 15.5V18C22 18.5523 21.5523 19 21 19H3C2.44772 19 2 18.5523 2 18V15.5C3.933 15.5 5 14.433 5 12.5C5 10.567 3.933 9.5 2 9.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9.5 10L14.5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M9.5 15H9.51" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M14.5 10H14.51" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

export function TicketIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M9 10.5L15 13.5M10.2426 7.75736L7.75736 10.2426M16.2426 13.7574L13.7574 16.2426M5.63604 12.364L3.51472 14.4853C2.73262 15.2674 2.73262 16.5327 3.51472 17.3148L6.68629 20.4853C7.46839 21.2674 8.73367 21.2674 9.51577 20.4853L11.636 18.364M18.364 11.636L20.4853 9.51472C21.2674 8.73262 21.2674 7.46734 20.4853 6.68524L17.3137 3.51472C16.5316 2.73262 15.2663 2.73262 14.4842 3.51472L12.364 5.63604M7.75736 10.2426L13.7574 16.2426L10.2426 7.75736L16.2426 13.7574L7.75736 10.2426Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}