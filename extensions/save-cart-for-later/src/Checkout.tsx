import {
  reactExtension,
  View,
  BlockStack,
  InlineStack,
  Text,
  Button,
  Spinner,
  useApi,
} from "@shopify/ui-extensions-react/checkout";
import { useEffect, useState } from "react";

export default reactExtension("purchase.checkout.block.render", () => (
  <ImportSavedCart />
));

function ImportSavedCart() {
  const api = useApi();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [savedCart, setSavedCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [themeSettings, setThemeSettings] = useState({
    text: "Retrieve your saved cart:",
    background: "base" as const, 
  });

  useEffect(() => {
    fetchThemeSettings();
    checkLoginStatus();
  }, []);

  const fetchThemeSettings = async () => {
    try {
      const res = await fetch(`${api.extension}/theme-settings`);
      const data = await res.json();
      setThemeSettings({
        text: data.text || "Retrieve your saved cart:",
        background: data.background || "base", 
      });
    } catch (err) {
      console.error("Error fetching theme settings:", err);
    }
  };

  const checkLoginStatus = async () => {
    try {
      const res = await fetch(`${api.extension}/check-login`);
      const data = await res.json();
      setIsLoggedIn(data.isLoggedIn);
      if (data.isLoggedIn) {
        fetchSavedCart();
      }
    } catch (err) {
      console.error("Error checking login status:", err);
      setError("Failed to check login status.");
    }
  };

  const fetchSavedCart = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${api.extension}/saved-cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ customerId: "123" }),
      });
      if (response.ok) {
        const cart = await response.json();
        setSavedCart(cart);
      } else {
        throw new Error("Failed to fetch saved cart.");
      }
    } catch (err) {
      console.error("Error fetching saved cart:", err);
      setError("Failed to fetch saved cart.");
    } finally {
      setLoading(false);
    }
  };

  const handleRetrieveCart = () => {
    if (savedCart) {
      console.log("Retrieved cart:", savedCart);
      alert("Cart retrieved successfully!");
    }
  };

  return (
    <View
      border="base"
      padding="base"
      cornerRadius="base"
      background={themeSettings.background}
    >
      <BlockStack spacing="loose">
        {error && (
          <Text size="small" appearance="critical">
            {error}
          </Text>
        )}
        {isLoggedIn ? (
          <InlineStack spacing="tight">
            <Text size="medium" emphasis="bold" appearance="info">
              {themeSettings.text}
            </Text>
            <Button onPress={handleRetrieveCart} disabled={loading}>
              {loading ? <Spinner /> : "Load Saved Cart"}
            </Button>
          </InlineStack>
        ) : (
          <InlineStack spacing="tight">
            <Text size="medium" emphasis="bold" appearance="subdued">
              To save or load your cart, please log in.
            </Text>
          </InlineStack>
        )}
      </BlockStack>
    </View>
  );
}
