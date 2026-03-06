export const CREDIT_CATEGORIES = {
  CR1_033: 'Créditos por Espacio de Integración Curricular / Proyecto de software (CR1_033)',
  CR2_ITI: 'Créditos por actividades de tipo formativas académicas y profesionales (CR2_ITI)',
  CR3_ITI: 'Créditos por actividades de tipo sociales, culturales y deportivas en la Universidad (CR3_ITI)',
  CR4_ITI: 'Créditos por actividades de tipo formativas en docencia e investigación (CR4_ITI)',
} as const;

export type CreditCategoryKey = keyof typeof CREDIT_CATEGORIES;
export type CreditCategoryValue = typeof CREDIT_CATEGORIES[CreditCategoryKey];

export const CREDIT_LIMITS: Record<CreditCategoryKey, number> = {
  CR1_033: 20,
  CR2_ITI: 5,
  CR3_ITI: 5,
  CR4_ITI: 5,
};

export const CATEGORY_LIST = Object.values(CREDIT_CATEGORIES);
