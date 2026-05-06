/**
 * Modal de Onboarding — Guía de 4 pasos para nuevos usuarios.
 * Fuente: plan.txt Fase 2.
 * 
 * Developer: Bienvenida → Reputación → Publicación → Disputas
 * Company: Acuerdo → Pagos simulados → Buenas prácticas → Evaluaciones
 */
'use client';

import { useState } from 'react';
import {
  Sparkles,
  Star,
  Upload,
  Shield,
  Handshake,
  CreditCard,
  BookOpen,
  MessageSquare,
  ArrowRight,
  ArrowLeft,
  X,
  Check,
} from 'lucide-react';
import { completeOnboarding } from '@/server-actions/profile.actions';
import { Button } from '@/components/ui/Button';

interface OnboardingStep {
  icon: React.ElementType;
  title: string;
  description: string;
  tips: string[];
}

const DEVELOPER_STEPS: OnboardingStep[] = [
  {
    icon: Sparkles,
    title: '¡Bienvenido a AgentVerse!',
    description: 'Eres parte de la comunidad de desarrolladores de agentes IA más innovadora.',
    tips: [
      'Completa tu perfil con tus habilidades y experiencia',
      'Añade un enlace a tu GitHub para mayor credibilidad',
      'Verifica tu correo para acceder a todas las funcionalidades',
    ],
  },
  {
    icon: Star,
    title: 'Sistema de Reputación',
    description: 'Tu reputación es tu carta de presentación. Se construye con cada acuerdo.',
    tips: [
      'Cada acuerdo completado mejora tu puntuación',
      'Las reseñas positivas impulsan tu visibilidad',
      'La antigüedad en la plataforma también suma puntos',
    ],
  },
  {
    icon: Upload,
    title: 'Publica tus Agentes',
    description: 'Muestra al mercado lo que tus agentes de IA pueden hacer.',
    tips: [
      'Usa descripciones claras y detalladas (Markdown soportado)',
      'Añade hasta 5 imágenes demostrativas',
      'Selecciona la modalidad de pago: Fijo, Por mes o Por hora',
    ],
  },
  {
    icon: Shield,
    title: 'Disputas y Protección',
    description: 'Tu trabajo está protegido por nuestro sistema de certificación bilateral.',
    tips: [
      'La empresa debe certificar la entrega para completar un acuerdo',
      'Puedes reportar incidencias desde la conversación',
      'Los acuerdos no certificados en 7 días se marcan automáticamente',
    ],
  },
];

const COMPANY_STEPS: OnboardingStep[] = [
  {
    icon: Handshake,
    title: '¡Bienvenido a AgentVerse!',
    description: 'Descubre y contrata los mejores agentes de IA para tu negocio.',
    tips: [
      'Completa tu perfil de empresa con la información correcta',
      'Verifica tu correo corporativo para operar',
      'Explora el catálogo de agentes disponibles',
    ],
  },
  {
    icon: CreditCard,
    title: 'Pagos Simulados',
    description: 'AgentVerse usa un sistema de pagos simulados para proteger ambas partes.',
    tips: [
      'Los pagos se simulan al aceptar una propuesta',
      'No se realizan transacciones reales de dinero',
      'El precio acordado queda registrado en el contrato',
    ],
  },
  {
    icon: BookOpen,
    title: 'Buenas Prácticas',
    description: 'Maximiza el resultado de tus colaboraciones siguiendo estas pautas.',
    tips: [
      'Describe claramente tus requerimientos en las ofertas',
      'Responde a los mensajes de forma oportuna',
      'Certifica las entregas satisfactorias a tiempo',
    ],
  },
  {
    icon: MessageSquare,
    title: 'Evaluaciones',
    description: 'Tu feedback es fundamental para la comunidad.',
    tips: [
      'Evalúa a los desarrolladores en tres áreas: profesionalidad, cumplimiento y comunicación',
      'Las reseñas son públicas y ayudan a otros a tomar decisiones',
      'Una buena reputación como empresa te convierte en un empleador atractivo',
    ],
  },
];

export function OnboardingModal({ role }: { role: string }) {
  const [open, setOpen] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);

  const steps = role === 'DEVELOPER' ? DEVELOPER_STEPS : COMPANY_STEPS;
  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  const handleComplete = async () => {
    setIsCompleting(true);
    await completeOnboarding();
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative max-h-[calc(100svh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-[#111118] shadow-2xl">
        {/* Progress bar */}
        <div className="h-1 bg-white/5">
          <div
            className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 transition-all duration-500 ease-out"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Close button */}
        <button
          onClick={handleComplete}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-all"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Content */}
        <div className="p-5 sm:p-6 lg:p-8">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === currentStep
                    ? 'w-8 bg-violet-500'
                    : i < currentStep
                    ? 'w-2 bg-violet-600/50'
                    : 'w-2 bg-white/10'
                }`}
              />
            ))}
          </div>

          {/* Icon */}
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600/10 mb-6">
            {step && <step.icon className="h-7 w-7 text-violet-400" />}
          </div>

          {/* Text */}
          <h2 className="text-xl font-bold text-white mb-2">{step?.title}</h2>
          <p className="text-sm text-gray-400 mb-6">{step?.description}</p>

          {/* Tips */}
          <ul className="space-y-3 mb-8">
            {step?.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-600/10 flex-shrink-0 mt-0.5">
                  <Check className="h-3 w-3 text-violet-400" />
                </div>
                {tip}
              </li>
            ))}
          </ul>

          {/* Navigation */}
          <div className="flex flex-col-reverse items-stretch justify-between gap-3 sm:flex-row sm:items-center">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Anterior
            </button>

            {isLast ? (
              <Button
                onClick={handleComplete}
                isLoading={isCompleting}
              >
                <Sparkles className="h-4 w-4" />
                ¡Empezar!
              </Button>
            ) : (
              <Button
                variant="secondary"
                onClick={() => setCurrentStep(currentStep + 1)}
              >
                Siguiente
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
