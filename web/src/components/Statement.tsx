/**
 * The pinned statement: a short scroll sequence between the marquee and the work.
 * GSAP pins it and scrubs each word out of a blur, then lights the key words
 * fuchsia as a rule fills (see Choreography). Without motion it is plain text.
 * The words are the About section's own description of the practice.
 */
export default function Statement() {
  return (
    <section className="statement" aria-labelledby="statement-title">
      <div className="statement-inner">
        <p className="statement-kicker"><span>Practice</span><span>00 / The whole chain</span></p>
        <h2 id="statement-title" className="statement-text">
          How data is <em>collected.</em> What a model can <em>legitimately</em> conclude. How that conclusion becomes something people can <em>use.</em>
        </h2>
        <div className="statement-rule" aria-hidden="true"><i /></div>
      </div>
    </section>
  );
}
