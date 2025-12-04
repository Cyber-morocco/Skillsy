import { Platform, StyleSheet } from 'react-native';

const ACCENT = '#7C3AED';
const BACKGROUND = '#050816';
const CARD = '#101936';
const TEXT_PRIMARY = '#F8FAFC';
const TEXT_SECONDARY = '#94A3B8';

export const authColors = {
  accent: ACCENT,
  background: BACKGROUND,
  card: CARD,
  text: TEXT_PRIMARY,
  muted: TEXT_SECONDARY,
  placeholder: '#64748B',
};

const sharedShadow =
  Platform.OS === 'ios'
    ? {
        shadowColor: ACCENT,
        shadowOpacity: 0.35,
        shadowOffset: { width: 0, height: 18 },
        shadowRadius: 28,
      }
    : {
        elevation: 12,
      };

export const authStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: 'center',
  },
  headingContainer: {
    marginBottom: 32,
  },
  brandPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(124, 58, 237, 0.16)',
    marginBottom: 12,
  },
  brandPillText: {
    color: ACCENT,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    fontSize: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: TEXT_SECONDARY,
    lineHeight: 22,
  },
  card: {
    backgroundColor: CARD,
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.25)',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    marginBottom: 20,
  },
  socialButtonIcon: {
    width: 18,
    height: 18,
    borderRadius: 4,
    backgroundColor: '#EA4335', 
    marginRight: 10,
  },
  socialButtonText: {
    color: '#111827',
    fontWeight: '600',
    fontSize: 14,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(148, 163, 184, 0.45)',
  },
  dividerText: {
    marginHorizontal: 12,
    color: TEXT_SECONDARY,
    fontSize: 13,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    color: TEXT_PRIMARY,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  input: {
    marginTop: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.35)',
    paddingHorizontal: 18,
    paddingVertical: Platform.OS === 'ios' ? 16 : 12,
    color: TEXT_PRIMARY,
    fontSize: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  inputFocused: {
    borderColor: ACCENT,
    backgroundColor: 'rgba(124, 58, 237, 0.12)',
    ...sharedShadow,
  },
  helperActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  helperText: {
    color: TEXT_SECONDARY,
    fontSize: 13,
  },
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxBox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.9)',
    marginRight: 8,
    backgroundColor: 'transparent',
  },
  checkboxLabel: {
    color: TEXT_SECONDARY,
    fontSize: 13,
  },
  link: {
    color: ACCENT,
    fontWeight: '600',
  },
  primaryButton: {
    marginTop: 20,
    borderRadius: 20,
    backgroundColor: ACCENT,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...sharedShadow,
  },
  primaryButtonText: {
    color: TEXT_PRIMARY,
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.2,
  },
  secondaryAction: {
    marginTop: 32,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryText: {
    color: TEXT_SECONDARY,
    marginRight: 6,
  },
  mutedInfo: {
    color: TEXT_SECONDARY,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 18,
  },
});


