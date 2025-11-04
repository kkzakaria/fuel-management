import * as React from "react";
import { CheckIcon, ChevronsUpDown } from "lucide-react";
import * as RPNInput from "react-phone-number-input";
import flags from "react-phone-number-input/flags";
import { getExampleNumber, parsePhoneNumberWithError } from "libphonenumber-js";
import examples from "libphonenumber-js/mobile/examples";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type PhoneInputProps = Omit<
  React.ComponentProps<"input">,
  "onChange" | "value" | "ref"
> &
  Omit<RPNInput.Props<typeof RPNInput.default>, "onChange"> & {
    onChange?: (value: RPNInput.Value) => void;
  };

/**
 * Calcule le nombre maximum de chiffres pour un numéro de téléphone
 * basé sur le code pays (ex: 10 chiffres pour CI - Côte d'Ivoire)
 */
const getMaxLengthForCountry = (country: RPNInput.Country): number => {
  try {
    const exampleNumber = getExampleNumber(country, examples);
    if (exampleNumber) {
      // Obtenir le numéro national sans l'indicatif pays
      const nationalNumber = exampleNumber.nationalNumber.toString();
      return nationalNumber.length;
    }
  } catch (error) {
    // En cas d'erreur, retourner une longueur par défaut
    console.debug(`Could not get max length for country ${country}:`, error);
  }
  // Longueur par défaut si le pays n'est pas trouvé
  return 15;
};

const PhoneInput: React.ForwardRefExoticComponent<PhoneInputProps> =
  React.forwardRef<React.ComponentRef<typeof RPNInput.default>, PhoneInputProps>(
    ({ className, onChange, value, defaultCountry, ...props }, ref) => {
      const [internalValue, setInternalValue] = React.useState<
        RPNInput.Value | undefined
      >(value as RPNInput.Value | undefined);

      const [country, setCountry] = React.useState<RPNInput.Country | undefined>(
        defaultCountry
      );

      // Synchroniser avec la prop value
      React.useEffect(() => {
        setInternalValue(value as RPNInput.Value | undefined);
      }, [value]);

      const handleChange = React.useCallback(
        (newValue: RPNInput.Value | undefined) => {
          // Si une valeur est fournie, valider la longueur
          if (newValue) {
            let isValid = true;

            try {
              // Parser le numéro de téléphone
              const phoneNumber = parsePhoneNumberWithError(newValue);

              if (phoneNumber && phoneNumber.country) {
                const maxLength = getMaxLengthForCountry(phoneNumber.country);
                const nationalNumber = phoneNumber.nationalNumber;

                // Si le numéro national dépasse la longueur maximale, rejeter
                if (nationalNumber.length > maxLength) {
                  isValid = false;
                }
              }
            } catch {
              // Si le parsing échoue mais qu'on a un defaultCountry, valider quand même
              if (defaultCountry) {
                // Extraire uniquement les chiffres (sans +, espaces, etc.)
                const digitsOnly = newValue.replace(/\D/g, "");
                const maxLength = getMaxLengthForCountry(defaultCountry);

                // Pour CI, le numéro commence par l'indicatif pays (225) + 10 chiffres
                // On doit vérifier uniquement les chiffres du numéro national
                const countryCallingCode = RPNInput.getCountryCallingCode(defaultCountry);
                const nationalDigits = digitsOnly.startsWith(countryCallingCode)
                  ? digitsOnly.slice(countryCallingCode.length)
                  : digitsOnly;

                // Si le numéro national dépasse la longueur maximale, rejeter
                if (nationalDigits.length > maxLength) {
                  isValid = false;
                }
              }
            }

            // Si la nouvelle valeur n'est pas valide, ne pas mettre à jour
            if (!isValid) {
              return;
            }

            // Mettre à jour l'état interne avec la nouvelle valeur valide
            setInternalValue(newValue);
          } else {
            // Valeur vide
            setInternalValue(undefined);
          }

          // Appeler le onChange original avec la nouvelle valeur valide
          onChange?.(newValue || ("" as RPNInput.Value));
        },
        [onChange, defaultCountry]
      );

      // Créer un InputComponent personnalisé qui reçoit country et value
      const CustomInputComponent = React.useMemo(
        () =>
          React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
            function CustomInput({ className, ...inputProps }, inputRef) {
              const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
                // Si c'est un chiffre, vérifier la longueur
                if (/^\d$/.test(e.key)) {
                  const currentValue = (e.currentTarget.value || "").replace(/\D/g, "");
                  const maxLength = country ? getMaxLengthForCountry(country) : 15;

                  // Extraire les chiffres du numéro national (sans indicatif pays)
                  let nationalDigits = currentValue;
                  if (country) {
                    const countryCallingCode = RPNInput.getCountryCallingCode(country);
                    if (currentValue.startsWith(countryCallingCode)) {
                      nationalDigits = currentValue.slice(countryCallingCode.length);
                    }
                  }

                  // Si on a déjà atteint la longueur maximale, bloquer la saisie
                  if (nationalDigits.length >= maxLength) {
                    e.preventDefault();
                    return;
                  }
                }

                // Appeler le handler original si présent
                inputProps.onKeyDown?.(e);
              };

              return (
                <Input
                  className={cn("rounded-e-lg rounded-s-none", className)}
                  {...inputProps}
                  onKeyDown={handleKeyDown}
                  ref={inputRef}
                />
              );
            }
          ),
        [country]
      );

      return (
        <RPNInput.default
          ref={ref}
          className={cn("flex", className)}
          flagComponent={FlagComponent}
          countrySelectComponent={CountrySelect}
          inputComponent={CustomInputComponent}
          smartCaret={false}
          defaultCountry={defaultCountry}
          value={internalValue || undefined}
          /**
           * Handles the onChange event with length validation.
           *
           * Validates phone number length based on country before updating.
           * For example, Côte d'Ivoire (CI) numbers are limited to 10 digits.
           * Uses controlled component pattern to enforce limits.
           */
          onChange={handleChange}
          onCountryChange={setCountry}
          {...props}
        />
      );
    },
  );
PhoneInput.displayName = "PhoneInput";

type CountryEntry = { label: string; value: RPNInput.Country | undefined };

type CountrySelectProps = {
  disabled?: boolean;
  value: RPNInput.Country;
  options: CountryEntry[];
  onChange: (country: RPNInput.Country) => void;
};

const CountrySelect = ({
  disabled,
  value: selectedCountry,
  options: countryList,
  onChange,
}: CountrySelectProps) => {
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);
  const [searchValue, setSearchValue] = React.useState("");
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Popover
      open={isOpen}
      modal
      onOpenChange={(open) => {
        setIsOpen(open);
        if (open) {
          setSearchValue("");
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="flex gap-1 rounded-e-none rounded-s-lg border-r-0 px-3 focus:z-10"
          disabled={disabled}
        >
          <FlagComponent
            country={selectedCountry}
            countryName={selectedCountry}
          />
          <ChevronsUpDown
            className={cn(
              "-mr-2 size-4 opacity-50",
              disabled ? "hidden" : "opacity-100",
            )}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput
            value={searchValue}
            onValueChange={(value) => {
              setSearchValue(value);
              setTimeout(() => {
                if (scrollAreaRef.current) {
                  const viewportElement = scrollAreaRef.current.querySelector(
                    "[data-radix-scroll-area-viewport]",
                  );
                  if (viewportElement) {
                    viewportElement.scrollTop = 0;
                  }
                }
              }, 0);
            }}
            placeholder="Search country..."
          />
          <CommandList>
            <ScrollArea ref={scrollAreaRef} className="h-72">
              <CommandEmpty>No country found.</CommandEmpty>
              <CommandGroup>
                {countryList.map(({ value, label }) =>
                  value ? (
                    <CountrySelectOption
                      key={value}
                      country={value}
                      countryName={label}
                      selectedCountry={selectedCountry}
                      onChange={onChange}
                      onSelectComplete={() => setIsOpen(false)}
                    />
                  ) : null,
                )}
              </CommandGroup>
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

interface CountrySelectOptionProps extends RPNInput.FlagProps {
  selectedCountry: RPNInput.Country;
  onChange: (country: RPNInput.Country) => void;
  onSelectComplete: () => void;
}

const CountrySelectOption = ({
  country,
  countryName,
  selectedCountry,
  onChange,
  onSelectComplete,
}: CountrySelectOptionProps) => {
  const handleSelect = () => {
    onChange(country);
    onSelectComplete();
  };

  return (
    <CommandItem className="gap-2" onSelect={handleSelect}>
      <FlagComponent country={country} countryName={countryName} />
      <span className="flex-1 text-sm">{countryName}</span>
      <span className="text-sm text-foreground/50">{`+${RPNInput.getCountryCallingCode(country)}`}</span>
      <CheckIcon
        className={`ml-auto size-4 ${country === selectedCountry ? "opacity-100" : "opacity-0"}`}
      />
    </CommandItem>
  );
};

const FlagComponent = ({ country, countryName }: RPNInput.FlagProps) => {
  const Flag = flags[country];

  return (
    <span className="flex h-4 w-6 overflow-hidden rounded-sm bg-foreground/20 [&_svg:not([class*='size-'])]:size-full">
      {Flag && <Flag title={countryName} />}
    </span>
  );
};

export { PhoneInput };
