import React, { useState, useEffect } from 'react';

export default function AboutViewComponent() {
  return (
    <>
    </>
  );
}

// <div className="container">
//   <h1>About Stay A While 2</h1>
//   <div className="panel">
//     <div>
//       <h2 style="margin-top: 0;">Story about the product</h2>
//       <p>
//         Welcome to <i>Stay a While 2</i>, the queueing system of KTH
//       </p>
//
//       <p>
//         Initially developed during DD1392 in 2015 by students and faculty with the intended audience of students and faculty, it’s the native system of the CSC school and its related sister schools.
//         Intended as the successor of several related systems it aims to provide a complete framework for queueing.
//       </p>
//       <p>
//         It has since been completely rewritten using more modern features while also getting bumped up regarding both security and speed.
//         We hope you will enjoy the experience ~
//       </p>
//
//       <p>
//         <a href="https://github.com/avacore1337/queueSystem">
//           <img src="/images/github.svg" height="14" width="14"> StayAWhile@GitHub
//         </a>
//         v 1.0.0.586
//         <br>
//         Admin: <a href="mailto:robertwb@kth.se?Subject=Stay%20A%20While" target="_top">robertwb@kth.se</a>
//       </p>
//
//       <h2>Contributors</h2>
//       <div className="row" style="font-size: .9em;">
//         <div className="col-md-4" ng-repeat="contributor in contributors.StayAWhile" style="margin-bottom: 2%;">
//           <div className="col-md-4">
//             <img className="frame" ng-src="http://gravatar.com/avatar/{{contributor.gravatar || '00000000000000000000000000000000'}}.png" alt="{{contributor.name}}">
//           </div>
//           <div className="col-md-8">
//             <h4>{{contributor.name}}</h4>
//             <a ng-if="contributor.github" href="https://github.com/{{contributor.github}}">
//               <i className="fi-social-github" style="font-size: 1em; color: #000000;"></i> {{contributor.github}}
//               <br>
//             </a>
//             <a ng-if="contributor.linkedIn" href="https://www.linkedin.com/profile/view?id={{contributor.linkedIn}}">
//               <i className="fi-social-linkedin" style="font-size: 1em; color: #0077B5;"></i> {{contributor.name}}
//               <!--<img src="/images/facebook.svg" height="14" width="14"> {{contributor.facebook}}-->
//             </a>
//           </div>
//         </div>
//       </div>
//     </div>
//
//     <div>
//       <h2>About QWait</h2>
//       <p>
//         Welcome to QWait [kuːˈwaɪt], the new open source, web based queueing manager developed for KTH CSC. Since the last millennium,
//         the mere mention of the queueing manager which must not be named has brought terror into the hearts of even the most
//         fearless students, but we say: no more. We have built QWait with a robust backend that will never give up on you,
//         and a lightweight web interface which can be used with your desktop, laptop, mobile device or toaster (given that it
//         supports HTML). Best of all: it makes queueing simple, just as it should be.
//       </p>
//       <p>
//         <a href="https://github.com/mvk13ogb/qwait">
//           <img src="/images/github.svg" height="14" width="14"> QWait@GitHub
//         </a>
//         v 1.1.18
//       </p>
//
//       <h2>Contributors</h2>
//       <div className="row">
//         <div className="col-md-4" ng-repeat="contributor in contributors.QWait" style="margin-bottom: 2%;">
//           <div className="col-md-4">
//             <img className="frame" ng-src="http://gravatar.com/avatar/{{contributor.gravatar || '00000000000000000000000000000000'}}.png" alt="{{contributor.name}}">
//           </div>
//           <div className="col-md-8">
//             <h4>{{contributor.name}}</h4>
//             <a ng-if="contributor.twitter" href="https://twitter.com/{{contributor.twitter}}">
//               <img src="/images/twitter.svg" height="14" width="14"> {{contributor.twitter}}
//             </a>
//             <a ng-if="contributor.github" href="https://github.com/{{contributor.github}}">
//               <img src="/images/github.svg" height="14" width="14"> {{contributor.github}}
//             </a>
//           </div>
//         </div>
//       </div>
//     </div>
//   </div>
// </div>
