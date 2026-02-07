Feature: Shopping Cart Total Verification

  Background:
    Given the app is set to English

  Scenario Outline: User adds products and verifies cart total
    Given I am logged in as "<user>" with cart data
    When I add the specified products to the cart
    Then the cart total should be correct

    Examples:
      | user   |
      | yamada |
      | sato   |
      | tanaka |
