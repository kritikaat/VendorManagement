import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { registerSchema, type RegisterFormValues } from '@/lib/validations/auth.schema';
import { USER_ROLES } from '@/types/auth.types';
import { useAuth } from '@/hooks/useAuth';

const VENDOR_CATEGORY_OPTIONS = [
  'Electronics',
  'Office Supplies',
  'Logistics',
  'Manufacturing',
  'Services',
  'Other',
];

const ROLE_OPTIONS = [
  { value: USER_ROLES.ADMIN, label: 'Admin' },
  { value: USER_ROLES.PROCUREMENT_OFFICER, label: 'Procurement Officer' },
  { value: USER_ROLES.APPROVER, label: 'Manager / Approver' },
  { value: USER_ROLES.VENDOR, label: 'Vendor' },
];

const COUNTRY_OPTIONS = ['India', 'United States', 'United Kingdom', 'Canada', 'Australia'];

export function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      country: 'India',
      additionalInfo: '',
      vendorProfile: {
        companyName: '',
        category: '',
        GSTNumber: '',
        address: '',
        city: '',
        state: '',
      },
    },
  });

  const selectedRole = watch('role');
  const isVendorRegistration = selectedRole === USER_ROLES.VENDOR;

  const onSubmit = async (values: RegisterFormValues) => {
    setError(null);
    try {
      await registerUser(values);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    }
  };

  return (
    <AuthLayout
      size="lg"
      title="Register"
      subtitle="Create your VendorBridge account"
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-emerald-700 hover:underline">
            Login
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input id="firstName" placeholder="First name" {...register('firstName')} />
            {errors.firstName ? (
              <p className="text-xs text-red-400">{errors.firstName.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" placeholder="Last name" {...register('lastName')} />
            {errors.lastName ? (
              <p className="text-xs text-red-400">{errors.lastName.message}</p>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              autoComplete="email"
              {...register('email')}
            />
            {errors.email ? (
              <p className="text-xs text-red-400">{errors.email.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder={isVendorRegistration ? '9876543210' : '+91 98765 43210'}
              {...register('phone')}
            />
            {errors.phone ? <p className="text-xs text-red-400">{errors.phone.message}</p> : null}
          </div>
        </div>

        {isVendorRegistration ? (
          <div className="space-y-4 rounded-lg border border-emerald-100 bg-emerald-50/50 p-4">
            <p className="text-sm font-medium text-emerald-900">Company profile</p>
            <p className="text-xs text-emerald-800">
              Vendor accounts need a company profile to appear in the vendor list and submit
              quotations.
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  placeholder="Acme Electronics Pvt Ltd"
                  {...register('vendorProfile.companyName')}
                />
                {errors.vendorProfile?.companyName ? (
                  <p className="text-xs text-red-400">{errors.vendorProfile.companyName.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Controller
                  control={control}
                  name="vendorProfile.category"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {VENDOR_CATEGORY_OPTIONS.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.vendorProfile?.category ? (
                  <p className="text-xs text-red-400">{errors.vendorProfile.category.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="GSTNumber">GST Number</Label>
                <Input
                  id="GSTNumber"
                  placeholder="29ABCDE1234F1Z5"
                  {...register('vendorProfile.GSTNumber')}
                />
                {errors.vendorProfile?.GSTNumber ? (
                  <p className="text-xs text-red-400">{errors.vendorProfile.GSTNumber.message}</p>
                ) : null}
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" placeholder="123 Tech Park" {...register('vendorProfile.address')} />
                {errors.vendorProfile?.address ? (
                  <p className="text-xs text-red-400">{errors.vendorProfile.address.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" placeholder="Bangalore" {...register('vendorProfile.city')} />
                {errors.vendorProfile?.city ? (
                  <p className="text-xs text-red-400">{errors.vendorProfile.city.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" placeholder="Karnataka" {...register('vendorProfile.state')} />
                {errors.vendorProfile?.state ? (
                  <p className="text-xs text-red-400">{errors.vendorProfile.state.message}</p>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.role ? <p className="text-xs text-red-400">{errors.role.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Controller
              control={control}
              name="country"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="country">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRY_OPTIONS.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a strong password"
              autoComplete="new-password"
              className="pr-10"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password ? (
            <p className="text-xs text-red-400">{errors.password.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="additionalInfo">Additional Information</Label>
          <Textarea
            id="additionalInfo"
            placeholder="Additional information..."
            {...register('additionalInfo')}
          />
        </div>

        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account...' : 'Register'}
        </Button>
      </form>
    </AuthLayout>
  );
}
