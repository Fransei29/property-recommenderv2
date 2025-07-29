/**
 * Componente ContactForm - Formulario de contacto
 */

'use client';

import React, { useState } from 'react';
import styles from './ContactForm.module.scss';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface ContactFormProps {
  className?: string;
}

export const ContactForm: React.FC<ContactFormProps> = ({
  className = ''
}) => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Simular envío del formulario
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Aquí iría la lógica real de envío del formulario
      console.log('Formulario enviado:', formData);
      
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      console.error('Error al enviar formulario:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.name.trim() && 
                     formData.email.trim() && 
                     formData.subject.trim() && 
                     formData.message.trim();

  return (
    <div className={`${styles.contactForm} ${className}`}>
      <div className={styles.formHeader}>
        <h3>Envíanos un mensaje</h3>
        <p>Estamos aquí para ayudarte. Completa el formulario y nos pondremos en contacto contigo pronto.</p>
      </div>

      {submitStatus === 'success' && (
        <div className={styles.successMessage}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22,4 12,14.01 9,11.01"/>
          </svg>
          <div>
            <h4>¡Mensaje enviado!</h4>
            <p>Gracias por contactarnos. Te responderemos en breve.</p>
          </div>
        </div>
      )}

      {submitStatus === 'error' && (
        <div className={styles.errorMessage}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          <div>
            <h4>Error al enviar</h4>
            <p>Hubo un problema al enviar tu mensaje. Por favor, inténtalo de nuevo.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>
              Nombre completo *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="Tu nombre completo"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="tu@email.com"
              required
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="subject" className={styles.label}>
            Asunto *
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            className={styles.input}
            placeholder="¿En qué podemos ayudarte?"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="message" className={styles.label}>
            Mensaje *
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            className={styles.textarea}
            placeholder="Cuéntanos más detalles..."
            rows={6}
            required
          />
        </div>

        <button
          type="submit"
          disabled={!isFormValid || isSubmitting}
          className={styles.submitButton}
        >
          {isSubmitting ? (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.spinner}>
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 2a10 10 0 0 1 10 10"/>
              </svg>
              Enviando...
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 2L11 13"/>
                <path d="M22 2l-7 20-4-9-9-4 20-7z"/>
              </svg>
              Enviar Mensaje
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ContactForm; 