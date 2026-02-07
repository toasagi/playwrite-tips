Feature: User Profile Management

  Background:
    Given the app is set to English

  Scenario Outline: User saves and verifies profile information
    Given I am logged in as "<user>"
    When I navigate to the profile page
    And I fill in the profile with name "<name>" phone "<phone>" and payment "<payment>"
    And I save the profile
    And I reload the page
    Then the name field should display "<name>"
    And the phone field should display "<phone>"
    And the payment method should be "<payment>"

    Examples:
      | user   | name          | phone         | payment          |
      | yamada | Taro Yamada   | 090-1234-5678 | credit_card      |
      | sato   | Hanako Sato   | 080-9876-5432 | bank_transfer    |
      | tanaka | Ichiro Tanaka | 070-1111-2222 | cash_on_delivery |
