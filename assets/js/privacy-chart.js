/* Three measured observations with monotone visual guides between them. */
(() => {
  "use strict";
  const points = [
    { epsilon: 0.49, auc: 0.933, low: 0.909, high: 0.957 },
    { epsilon: 2, auc: 0.944, low: 0.927, high: 0.960 },
    { epsilon: 6, auc: 0.945, low: 0.928, high: 0.961 },
  ];
  const ns = "http://www.w3.org/2000/svg";
  document.querySelectorAll("[data-privacy-chart]").forEach((root, widgetIndex) => {
    const svg = root.querySelector("[data-privacy-plot]");
    const controls = [...root.querySelectorAll("[data-privacy-select]")];
    const scale = root.querySelector("[data-privacy-full-scale]");
    let selected = 0;
    let full = false;
    const format = n => n.toFixed(3);
    const put = (tag, attrs, text) => {
      const el = document.createElementNS(ns, tag);
      Object.entries(attrs || {}).forEach(([key, value]) => el.setAttribute(key, value));
      if (text !== undefined) el.textContent = text;
      return el;
    };
    const render = () => {
      const W = 680, H = 510, left = 72, right = 654, top = 48, bottom = 416;
      const yMin = full ? 0 : 0.90, yMax = full ? 1 : 0.97;
      const y = value => bottom - (value - yMin) / (yMax - yMin) * (bottom - top);
      const x = value => left + (Math.log(value) - Math.log(0.25)) / (Math.log(8) - Math.log(0.25)) * (right - left);
      // Monotone cubic Hermite interpolation preserves all observed values.
      // These guides are not a fitted predictive model or estimates at new epsilon values.
      const guide = coordinates => {
        const n=coordinates.length;
        const delta=coordinates.slice(1).map((p,i)=>(p.y-coordinates[i].y)/(p.x-coordinates[i].x));
        const slopes=coordinates.map((_p,i)=>{
          if(i===0)return delta[0];
          if(i===n-1)return delta[n-2];
          if(delta[i-1]*delta[i]<=0)return 0;
          const a=coordinates[i].x-coordinates[i-1].x;
          const b=coordinates[i+1].x-coordinates[i].x;
          return (3*(a+b))/((2*b+a)/delta[i-1]+(b+2*a)/delta[i]);
        });
        let path="M"+coordinates[0].x+" "+coordinates[0].y;
        for(let i=0;i<n-1;i++){
          const a=coordinates[i],b=coordinates[i+1],w=(b.x-a.x)/3;
          path+="C"+(a.x+w)+" "+(a.y+slopes[i]*w)+" "+(b.x-w)+" "+(b.y-slopes[i+1]*w)+" "+b.x+" "+b.y;
        }
        return path;
      };
      const titleId = "privacy-live-title-" + widgetIndex;
      const descId = "privacy-live-desc-" + widgetIndex;
      svg.replaceChildren();
      svg.setAttribute("viewBox", "0 0 " + W + " " + H);
      svg.setAttribute("role", "group");
      svg.setAttribute("aria-labelledby", titleId + " " + descId);
      svg.append(put("title", { id: titleId }, "Measured prediction ROC-AUC at three privacy budgets"),
        put("desc", { id: descId }, "Select a measured point or use the buttons below. Whiskers are 95% t intervals across five seeds, not population uncertainty. Lower epsilon means stronger privacy. " + (full ? "Full AUC axis, zero to one." : "Truncated AUC axis, 0.90 to 0.97.")));
      const ticks = full ? [0, 0.2, 0.4, 0.6, 0.8, 1] : [0.90, 0.91, 0.92, 0.93, 0.94, 0.95, 0.96, 0.97];
      ticks.forEach(value => {
        svg.append(put("line", {x1:left,y1:y(value),x2:right,y2:y(value),class:"privacy-gridline"}));
        svg.append(put("text", {x:left-12,y:y(value)+5,"text-anchor":"end",class:"privacy-tick"}, value.toFixed(full ? 1 : 2)));
      });
      svg.append(put("path", {d:"M"+left+" "+top+"V"+bottom+"H"+right,class:"privacy-axis"}));
      svg.append(put("line",{x1:left,y1:y(0.953),x2:right,y2:y(0.953),class:"privacy-reference"}));
      svg.append(put("text",{x:right,y:y(0.953)-9,"text-anchor":"end",class:"privacy-reference-label"},"Non-private HGB reference · 0.953"));
      const coordinates = key => points.map(p=>({x:x(p.epsilon),y:y(p[key])}));
      const upper=guide(coordinates("high"));
      const lower=guide(coordinates("low").reverse());
      svg.append(put("path",{d:upper+"L"+coordinates("low").at(-1).x+" "+coordinates("low").at(-1).y+lower.replace(/^M[^C]+/,"")+"Z",class:"privacy-bloom"}));
      svg.append(put("path",{d:guide(coordinates("auc")),class:"privacy-fit"}));
      svg.append(put("line",{x1:x(points[selected].epsilon),y1:y(points[selected].auc),x2:x(points[selected].epsilon),y2:bottom,class:"privacy-selection-guide"}));
      points.forEach((point, index) => {
        const px=x(point.epsilon), py=y(point.auc), lo=y(point.low), hi=y(point.high);
        svg.append(put("line",{x1:px,y1:top,x2:px,y2:bottom,class:"privacy-gridline"}));
        svg.append(put("text",{x:px,y:bottom+27,"text-anchor":"middle",class:"privacy-tick"},String(point.epsilon)));
        const g=put("g",{"data-point":index,class:"privacy-measure"+(index===selected?" is-selected":""),role:"button",tabindex:"0","aria-pressed":String(index===selected),"aria-label":"Select epsilon "+point.epsilon+", mean AUC "+format(point.auc)+", 95 percent t interval "+format(point.low)+" to "+format(point.high)});
        g.append(put("rect",{x:px-12,y:hi,width:24,height:lo-hi,class:"privacy-interval-wash"}),
          put("path",{d:"M"+px+" "+hi+"V"+lo+"M"+(px-9)+" "+hi+"H"+(px+9)+"M"+(px-9)+" "+lo+"H"+(px+9),class:"privacy-whisker"}),
          put("circle",{cx:px,cy:py,r:25,class:"privacy-hit"}),
          put("circle",{cx:px,cy:py,r:index===selected?8:6,class:"privacy-dot"}),
          put("text",{x:px,y:Math.max(22,hi-12),"text-anchor":"middle",class:"privacy-point-label"},format(point.auc)));
        const activate = () => choose(index);
        g.addEventListener("click",activate);
        g.addEventListener("keydown",event=>{
          if(event.key==="Enter"||event.key===" "){event.preventDefault();choose(index);controls[index]?.focus();}
          if(event.key==="ArrowRight"||event.key==="ArrowLeft"){
            event.preventDefault();
            const next=(index+(event.key==="ArrowRight"?1:2))%3;
            choose(next); controls[next]?.focus();
          }
        });
        svg.append(g);
      });
      svg.append(put("text",{x:(left+right)/2,y:bottom+61,"text-anchor":"middle",class:"privacy-axis-label"},"Privacy budget ε · logarithmic scale"));
      svg.append(put("text",{x:(left+right)/2,y:bottom+86,"text-anchor":"middle",class:"privacy-axis-note"},"Lower ε means stronger privacy"));
      svg.append(put("text",{transform:"translate(21 "+((top+bottom)/2)+") rotate(-90)","text-anchor":"middle",class:"privacy-axis-label"},"Prediction ROC-AUC"));
      const axis = root.querySelector("[data-privacy-axis-note]");
      if(axis) axis.textContent = full ? "Full AUC axis: 0–1." : "AUC axis truncated to 0.90–0.97 to show variation.";
    };
    const choose = index => {
      const previousGuideX = Number(svg.querySelector(".privacy-selection-guide")?.getAttribute("x1"));
      selected=index;
      const point=points[index];
      controls.forEach((button,i)=>button.setAttribute("aria-pressed",String(i===index)));
      root.querySelectorAll("[data-privacy-epsilon]").forEach(el=>el.textContent=String(point.epsilon));
      root.querySelectorAll("[data-privacy-auc]").forEach(el=>el.textContent=format(point.auc));
      root.querySelectorAll("[data-privacy-interval]").forEach(el=>el.textContent="["+format(point.low)+", "+format(point.high)+"]");
      root.querySelectorAll("[data-privacy-gap]").forEach(el=>el.textContent=(0.953-point.auc).toFixed(3));
      const status=root.querySelector("[data-privacy-status]");
      if(status)status.textContent="Selected ε "+point.epsilon+": mean prediction AUC "+format(point.auc)+", 95% t interval "+format(point.low)+"–"+format(point.high)+".";
      if (!svg.querySelector(".privacy-measure")) render();
      else {
        svg.querySelectorAll(".privacy-measure").forEach((mark, i) => {
          mark.classList.toggle("is-selected", i === selected);
          mark.setAttribute("aria-pressed", String(i === selected));
          mark.querySelector(".privacy-dot").setAttribute("r", i === selected ? "8" : "6");
        });
        const guide = svg.querySelector(".privacy-selection-guide");
        const mark = svg.querySelector(".is-selected .privacy-dot");
        guide.setAttribute("x1", mark.getAttribute("cx"));
        guide.setAttribute("x2", mark.getAttribute("cx"));
        guide.setAttribute("y1", mark.getAttribute("cy"));
      }
      const guideX = Number(svg.querySelector(".privacy-selection-guide").getAttribute("x1"));
      root.dispatchEvent(new CustomEvent("privacyselect", { bubbles: true, detail: { offsetX: Number.isFinite(previousGuideX) ? previousGuideX - guideX : 0 } }));
    };
    controls.forEach((button,index)=>{
      button.addEventListener("click",()=>choose(index));
      button.addEventListener("keydown",event=>{
        if(event.key==="ArrowRight"||event.key==="ArrowLeft"){
          event.preventDefault();
          const next=(index+(event.key==="ArrowRight"?1:2))%3;
          choose(next);controls[next].focus();
        }
      });
    });
    scale?.addEventListener("change",()=>{full=scale.checked;render();});
    root.classList.add("privacy-enhanced");
    root.querySelector(".privacy-controls")?.removeAttribute("hidden");
    scale?.closest("label")?.removeAttribute("hidden");
    choose(0);
  });
})();
