import { ArrowRight, Code2 } from "lucide-react";
import { Link } from "react-router-dom";

const MeetTheCodersCTA = () => {
  return (
    <section className="py-20 relative">
       <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-cyan-500/10" />
       <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/20 rounded-full blur-3xl" />
      <div className="container mx-auto px-4">
        <div className="glass rounded-3xl p-8 md:p-16 text-center max-w-4xl mx-auto border-primary/20 glow-box">
        

          {/* Label */}
          <span className="text-primary font-mono text-sm uppercase tracking-wider">
            // The Humans Behind the Code
          </span>

          {/* Title */}
          <h2 className="text-3xl md:text-5xl font-bold mt-6 mb-6 leading-tight">
            Meet the <span className="text-primary">Coders</span>
          </h2>

          {/* Description */}
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-10">
            Built by developers who actually write the code, break the builds,
            and ship the fixes.
          </p>

          {/* CTA */}
          <Link
            to="/developers"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition"
          >
            Meet the Coders
            <ArrowRight className="w-5 h-5" />
          </Link>

          {/* Footer line */}
          <p className="mt-6 text-sm text-muted-foreground font-mono">
            Built by developers, for developers.
          </p>
        </div>
      </div>
    </section>
  );
};

export default MeetTheCodersCTA;
