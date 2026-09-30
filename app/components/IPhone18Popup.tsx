"use client"; 
import { useEffect, useState } from "react"; 
import Image from "next/image"; 
 
export default function IPhone18Popup() { 
  const [visible, setVisible] = useState(false); 
  const [show, setShow] = useState(false); 
 
  useEffect(() => { 
    if (sessionStorage.getItem("popup_shown")) return; 
    const t = setTimeout(() => { 
      setVisible(true); 
      sessionStorage.setItem("popup_shown", "true"); 
      setTimeout(() => setShow(true), 20); 
    }, 700); 
    return () => clearTimeout(t); 
  }, []); 
 
  function close() { 
    setShow(false); 
    setTimeout(() => setVisible(false), 320); 
  } 
 
  if (!visible) return null; 
 
  return ( 
    <> 
      <style>{` 
        @keyframes _in  { from{transform:translateY(100%)} to{transform:translateY(0)} } 
        @keyframes _out { from{transform:translateY(0)} to{transform:translateY(100%)} } 
        @keyframes _sh  { 0%{background-position:-200% center} 100%{background-position:200% center} } 
        @keyframes _zoom { from{transform:scale(1)} to{transform:scale(1.08)} } 
        @keyframes _pulse { 0%,100%{opacity:1} 50%{opacity:0.6} } 
      `}</style> 
 
      <div onClick={close} style={{ 
        position:"fixed", inset:0, zIndex:9999, 
        display:"flex", alignItems:"center", justifyContent:"center", 
        background:"rgba(0,0,0,0.5)", backdropFilter:"blur(6px)", 
      }}> 
        <div dir="rtl" onClick={e => e.stopPropagation()} style={{ 
          position:"relative", width:"100%", maxWidth:"480px", 
          borderRadius:"24px 24px 0 0", overflow:"hidden", 
          boxShadow:"0 -4px 40px rgba(0,0,0,0.6)", 
          animation: show ? "_in 0.4s cubic-bezier(0.22,1,0.36,1) forwards" : "_out 0.3s ease forwards", 
        }}> 
 
          {/* BG image */} 
          <Image src="/iphone-18.webp" alt="آيفون 18" fill loading="lazy" 
            style={{ 
              objectFit:"cover", objectPosition:"center 0%", 
              animation:"_zoom 8s ease-in-out infinite alternate", 
              transformOrigin:"center center", 
            }} /> 
 
          {/* gradient overlay */} 
          <div style={{ 
            position:"absolute", inset:0, 
            background:"linear-gradient(to bottom, rgba(3,14,20,0.1) 0%, rgba(3,14,20,0.55) 45%, rgba(3,14,20,0.92) 75%, #030e14 100%)", 
          }} /> 
 
          {/* drag handle */} 
          <div style={{ 
            position:"absolute", top:"10px", left:"50%", transform:"translateX(-50%)", 
            width:"36px", height:"4px", borderRadius:"2px", background:"rgba(255,255,255,0.25)", zIndex:10, 
          }} /> 
 
          {/* Close */} 
          <button onClick={close} aria-label="إغلاق" style={{ 
            position:"absolute", top:"12px", left:"12px", zIndex:10, 
            width:"28px", height:"28px", borderRadius:"50%", 
            background:"rgba(0,0,0,0.4)", border:"1px solid rgba(255,255,255,0.15)", 
            color:"rgba(255,255,255,0.8)", fontSize:"12px", cursor:"pointer", 
            display:"flex", alignItems:"center", justifyContent:"center", 
          }}>✕</button> 
 
          {/* Content */} 
          <div style={{ position:"relative", zIndex:2, padding:"90px 20px 24px", textAlign:"center" }}> 
 
            {/* Badge */} 
            <div style={{ 
              display:"inline-flex", alignItems:"center", gap:"6px", 
              background:"rgba(31,122,140,0.25)", border:"1px solid rgba(31,122,140,0.5)", 
              borderRadius:"99px", padding:"4px 14px", marginBottom:"14px", 
            }}> 
              <span style={{ width:"7px", height:"7px", borderRadius:"50%", background:"#4ade80", animation:"_pulse 1.5s ease-in-out infinite", flexShrink:0 }} /> 
              <span style={{ color:"#7dd4e8", fontSize:"11px", fontWeight:700, letterSpacing:"0.5px" }}>متوفر الحين</span> 
            </div> 
 
            {/* Title */} 
            <h2 style={{ 
              color:"#fff", fontSize:"52px", fontWeight:800, 
              margin:"0 0 6px", lineHeight:1, letterSpacing:"-2px", 
            }}>iPhone 18</h2> 
 
            {/* Shining subtitle */} 
            <p style={{ 
              fontWeight:800, fontSize:"18px", margin:"0 0 10px", 
              background:"linear-gradient(90deg,#fff,#7dd4e8,#fff)", 
              backgroundSize:"200% auto", 
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", 
              animation:"_sh 3s linear infinite", 
            }}> 
              🎉 وصل الحين — تقدر تطلبه الآن! 
            </p> 
 
            <p style={{ color:"rgba(255,255,255,0.55)", fontSize:"13px", margin:"0 0 20px", lineHeight:1.6 }}> 
              آيفون 18 وصل للبلاد. اطلبه الحين وخله يوصلك لين عندك. 
            </p> 
 
            {/* CTA */} 
            <a href="/smartphones/iphone-18-pro-max" onClick={close} style={{ 
              display:"block", width:"100%", padding:"14px", 
              background:"linear-gradient(135deg,#155E6F,#1F7A8C)", 
              color:"#fff", textAlign:"center", textDecoration:"none", 
              borderRadius:"12px", fontSize:"15px", fontWeight:800, 
              boxShadow:"0 8px 28px rgba(21,94,111,0.45)", letterSpacing:"0.3px", 
              marginBottom:"12px", 
            }}> 
              اطلبه الحين — iPhone 18 
            </a> 
 
            <p style={{ textAlign:"center", color:"rgba(255,255,255,0.15)", fontSize:"10px", margin:0 }}> 
              مؤسسة البلاد الحديثة للإلكترونيات 
            </p> 
          </div> 
        </div> 
      </div> 
    </> 
  ); 
}
