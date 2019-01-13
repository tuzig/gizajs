describe('The Home Page', function() {
  it('successfully loads', function() {
    cy.visit('/');
  });
  it('has team members', function () {
    cy.visit('/');
    cy.get('.team-member').should('length.gte', 4);
  });
});

describe('The Bio', function() {
  it('can be reached from home', function() {
      cy.visit('/');
      cy.contains('דואני').click();
      cy.url().should('include', '/itzik');
  });
  it('successfully loads', function() {
    cy.visit('/giza/bio');
  });
});
