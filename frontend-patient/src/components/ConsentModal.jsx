import React, { useState } from 'react';
import './ConsentModal.css';

const ConsentModal = ({ onAccept, onDecline }) => {
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    if (!agreed) {
      alert('Please check the consent box to continue');
      return;
    }

    setLoading(true);
    try {
      await onAccept();
    } catch (error) {
      console.error('Error accepting consent:', error);
      setLoading(false);
    }
  };

  const handleDecline = () => {
    if (window.confirm('You must accept the consent to use the patient portal. Are you sure you want to decline? You will be logged out.')) {
      onDecline();
    }
  };

  return (
    <div className="consent-modal-overlay">
      <div className="consent-modal">
        <div className="consent-modal-header">
          <h2>🏥 Patient Portal Access Consent</h2>
          <p className="consent-subtitle">Please review and accept to continue</p>
        </div>

        <div className="consent-modal-body">
          <div className="consent-section">
            <h3>Welcome to Ashwini Healthcare Patient Portal</h3>
            <p>
              To provide you with the best healthcare experience, we need your consent to access
              and display your health information through this portal.
            </p>
          </div>

          <div className="consent-section">
            <h4>📋 What You're Consenting To:</h4>
            <ul className="consent-list">
              <li>
                <strong>Portal Access:</strong> You consent to access your health records,
                measurements, prescriptions, and visit history through this secure patient portal.
              </li>
              <li>
                <strong>Data Display:</strong> Your personal health information (including vital signs,
                medical notes, and prescriptions) will be displayed on this portal when you log in.
              </li>
              <li>
                <strong>Real-time Updates:</strong> Your health data will be updated in real-time
                as measurements are taken and doctors update your records.
              </li>
              <li>
                <strong>Secure Access:</strong> You are responsible for keeping your login credentials
                secure and not sharing them with unauthorized individuals.
              </li>
            </ul>
          </div>

          <div className="consent-section privacy-notice">
            <h4>🔒 Privacy & Security:</h4>
            <p>
              Your health information is protected under HIPAA and our privacy policies.
              We use industry-standard encryption and security measures to protect your data.
              You can review our complete privacy policy in your profile settings.
            </p>
          </div>

          <div className="consent-section rights-notice">
            <h4>✓ Your Rights:</h4>
            <ul className="consent-list">
              <li>You may request copies of your health records at any time</li>
              <li>You can revoke portal access by contacting the hospital reception</li>
              <li>You have the right to request corrections to your information</li>
              <li>Your data will only be shared with authorized healthcare providers</li>
            </ul>
          </div>

          <div className="consent-checkbox-container">
            <label className="consent-checkbox-label">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="consent-checkbox"
              />
              <span>
                I have read and understood the above information. I consent to access my health
                information through the Ashwini Healthcare Patient Portal. I understand that I am
                responsible for maintaining the confidentiality of my login credentials.
              </span>
            </label>
          </div>
        </div>

        <div className="consent-modal-footer">
          <button
            className="btn-decline"
            onClick={handleDecline}
            disabled={loading}
          >
            Decline & Logout
          </button>
          <button
            className="btn-accept"
            onClick={handleAccept}
            disabled={!agreed || loading}
          >
            {loading ? 'Processing...' : 'Accept & Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsentModal;
