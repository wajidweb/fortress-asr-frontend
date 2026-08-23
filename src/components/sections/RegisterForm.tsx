import React, { useState } from 'react';
import { Users, FileText, CheckCircle, AlertCircle } from 'lucide-react';

export const RegisterForm: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [siaNumber, setSiaNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
    }, 1500);
  };

  return (
    <section id="register" className="py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10">
        
        <div className="space-y-4">
          <span className="text-[#032031] font-bold text-xs uppercase tracking-widest">Self Registration</span>
          <h2 className="text-3xl sm:text-4xl font-black uppercase text-[#032031] tracking-wide">
            Guard Onboarding
          </h2>
          <div className="w-12 h-1 bg-[#032031] mx-auto rounded"></div>
          <p className="text-slate-500 text-sm max-w-xl mx-auto leading-relaxed">
            Welcome to the Fortress ASR Officer network. Please complete your registration details and compliance documents to authorize your credentials.
          </p>
        </div>

        {success ? (
          <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col items-center space-y-4 text-center max-w-xl mx-auto animate-fade-in shadow-sm">
            <div className="p-3 bg-emerald-500 text-white rounded-full">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-emerald-900 uppercase">Registration Submitted</h3>
            <p className="text-xs text-emerald-700 leading-relaxed">
              Your profile has been queued for verification. Our administrative compliance team will audit your SIA licence and Right to Work documents. You will receive an invitation email shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-200 rounded-2xl p-8 space-y-6 text-left shadow-sm max-w-xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-2">First Name</label>
                <input 
                  type="text" 
                  required 
                  value={firstName} 
                  onChange={(e) => setFirstName(e.target.value)} 
                  placeholder="James" 
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#032031] transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-2">Last Name</label>
                <input 
                  type="text" 
                  required 
                  value={lastName} 
                  onChange={(e) => setLastName(e.target.value)} 
                  placeholder="Carter" 
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#032031] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-slate-700 mb-2">Email Address</label>
              <input 
                type="email" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="james.carter@fortress.co.uk" 
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#032031] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-slate-700 mb-2">SIA Licence Number</label>
              <input 
                type="text" 
                required 
                value={siaNumber} 
                onChange={(e) => setSiaNumber(e.target.value)} 
                placeholder="E.g., 9048 2234 1192 1095" 
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#032031] transition-all"
              />
            </div>

            <div className="p-4 bg-[#032031]/5 border border-[#032031]/10 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#032031] flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-[#032031] font-semibold leading-relaxed">
                By submitting this form, you authorize Fortress ASR to cross-check your active SIA registry records and Right to Work status against governmental databases.
              </p>
            </div>

            <button 
              type="submit" 
              disabled={submitting}
              className="w-full py-3.5 bg-[#032031] hover:bg-slate-800 disabled:opacity-75 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2"
            >
              {submitting ? 'Verifying Coordinates...' : 'Submit Onboarding Request'}
            </button>
          </form>
        )}

      </div>
    </section>
  );
};
export default RegisterForm;
