declare module "react-flight-indicators" {
  import { FC } from "react";

  interface AttitudeIndicatorProps {
    roll?: number;
    pitch?: number;
    showBox?: boolean;
    size?: number;
  }

  interface HeadingIndicatorProps {
    heading?: number;
    showBox?: boolean;
    size?: number;
  }

  interface VariometerProps {
    vario?: number;
    showBox?: boolean;
    size?: number;
  }

  interface TurnCoordinatorProps {
    turn?: number;
    showBox?: boolean;
    size?: number;
  }

  interface AirspeedProps {
    speed?: number;
    showBox?: boolean;
    size?: number;
  }

  interface AltimeterProps {
    altitude?: number;
    showBox?: boolean;
    size?: number;
  }

  export const AttitudeIndicator: FC<AttitudeIndicatorProps>;
  export const HeadingIndicator: FC<HeadingIndicatorProps>;
  export const Variometer: FC<VariometerProps>;
  export const TurnCoordinator: FC<TurnCoordinatorProps>;
  export const Airspeed: FC<AirspeedProps>;
  export const Altimeter: FC<AltimeterProps>;
}
