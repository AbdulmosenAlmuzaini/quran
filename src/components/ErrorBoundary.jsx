import React from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col items-center justify-center p-6 antialiased">
          <div className="relative max-w-xl w-full">
            {/* Glowing red accent */}
            <div className="absolute -inset-1.5 bg-gradient-to-tr from-rose-600 to-amber-500 rounded-3xl blur-xl opacity-20" />
            
            <div className="relative bg-slate-905 border border-rose-500/20 p-8 md:p-10 rounded-3xl flex flex-col gap-6 shadow-2xl backdrop-blur-md">
              <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
                <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 flex-shrink-0">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-rose-400">عذراً، حدث خطأ في التطبيق</h2>
                  <p className="text-xs text-slate-400 mt-1">لقد التقط نظام الحماية البرمجية خطأً غير متوقع.</p>
                </div>
              </div>

              {/* Error Message Details */}
              <div className="flex flex-col gap-2 bg-slate-950/80 border border-slate-900 rounded-2xl p-4 text-left font-mono text-xs overflow-x-auto max-h-[250px]">
                <p className="text-rose-300 font-bold mb-1">Error: {this.state.error?.toString()}</p>
                {this.state.errorInfo?.componentStack && (
                  <pre className="text-slate-500 whitespace-pre-wrap leading-relaxed">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={this.handleReset}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-750 px-5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>إعادة تحميل الصفحة</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
